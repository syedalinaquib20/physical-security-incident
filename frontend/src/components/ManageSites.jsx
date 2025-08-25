import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { FaPlus, FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight, FaFileUpload } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { FaCircleInfo } from "react-icons/fa6";
import { IoMdArrowRoundBack } from "react-icons/io";
import LoadingBar from 'react-top-loading-bar';
import { useRef } from 'react';

const ManageSites = () => {
    const [sites, setSites] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [loading, setLoading] = useState(false);
    const [totalSites, setTotalSites] = useState(0);
    const [currentSites, setCurrentSites] = useState({
        site_id: null, 
        site_code: "",
        site_name: ""
    });

    const navigate = useNavigate();
    const loadingBar = useRef(null);

    useEffect(() => {
        fetchSites(searchQuery, currentPage, itemsPerPage);
    }, [searchQuery, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchRegions();
    }, []);

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
                setErrorMessage("");
            }, 3000);

            return () => clearTimeout(timer);
        }   
    }, [successMessage, errorMessage]);

    const fetchSites = async (query = "", page = 1, limit = itemsPerPage) => {
        try{
            loadingBar.current.continuousStart();
            const response = await axios.get("http://localhost:5000/manage-sites", {
                params: { q: query, page, limit } 
            });

            if (response.data && response.data.sites) {
                const sortedSites = [...response.data.sites].sort((a, b) => a.site_id - b.site_id);
                setSites(sortedSites);
                setTotalSites(response.data.total || sortedSites.length);
            } else {
                setSites([]);
                setTotalSites(0);
            }

        } catch (error) {
            console.error("Error fetching sites:", error);
            setErrorMessage("Failed to fetch sites. Please try again later.");
        } finally {
            loadingBar.current.complete();
        }
    }

    const fetchRegions = async () => {
        try {
            loadingBar.current.continuousStart();
            const response = await axios.get("http://localhost:5000/manage-regions");

            if (response.data && response.data.regions) {
                setRegions(response.data.regions);
            } else {
                setRegions([]);
            }

        } catch (error) {
            console.error("Error fetching regions:", error);
            setErrorMessage("Failed to fetch regions. Please try again later.");
        }
    }

    const handleUploadFileChange = (e) => {
      setUploadFile(e.target.files[0]);
    }

    const handleUploadSubmit = async () => {
        if (!uploadFile) {
            setErrorMessage("Please select a file to upload");
            return;
        }

        const reader = new FileReader();
        reader.readAsArrayBuffer(uploadFile);

        reader.onload = async (e) => {
            setLoading(true);
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    const rows = jsonData.slice(1);

                    const [regionsRes] = await Promise.all([
                        axios.get("http://localhost:5000/manage-regions")
                    ]);

                    const regionMap = {};
                    (regionsRes.data.regions || []).forEach((r) => {
                        if (r.region_name) {
                            regionMap[r.region_name.trim().toLowerCase()] = r.region_id;
                        }
                    });

                    let formattedData = [];
                    const failedRows = [];
                    const skippedRows = [];
                    const siteNameMap = new Map();

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];

                        const site_code = row[0]?.toString();
                        const site_name_raw = row[1]?.toString();
                        const regionNameRaw = row[2]?.toString();

                        const site_name = site_name_raw ? site_name_raw.trim() : null;
                        const normalizedSiteName = site_name ? site_name.toLowerCase() : null; 
                        const regionName = regionNameRaw ? regionNameRaw.trim().toLowerCase() : null;

                        const region_id = regionMap[regionName];

                        const missingFields = [];
                        if (!site_code) missingFields.push("Site Code");
                        if (!site_name) missingFields.push("Site Name");
                        if (!region_id) missingFields.push("Region");

                        if (missingFields.length > 0) {
                            failedRows.push({
                                row: i + 2,
                                errors: `Missing fields: ${missingFields.join(", ")}`
                            });
                        } else {
                            const key = normalizedSiteName;
                            if (siteNameMap.has(key)) {
                                skippedRows.push({
                                    row: i + 2,
                                    reason: `Duplicate site name in upload Excel: ${site_name}`
                                });
                                continue;
                            } else {
                                siteNameMap.set(key, true);
                                formattedData.push({ site_code, site_name, region_id });
                        }
                    }
                } 
            
                // Duplicate Sites Check 
                const sites = formattedData.map(r => ({
                    site_name: r.site_name,
                }));
                const dupRes = await axios.post(
                    "http://localhost:5000/check-duplicate-sites", 
                    { sites }
                );

                if (dupRes.data.duplicates.length > 0) {
                    const duplicateSet = new Set(
                        dupRes.data.duplicates.map(
                            (dup) => 
                                `${dup.site_name.toLowerCase()}`
                        )
                    );

                    formattedData = formattedData.filter((s) => {
                        const key = `${s.site_name.toLowerCase()}`;
                        if (duplicateSet.has(key)) {
                            skippedRows.push({
                                row: s.row,
                                reason: `Site already exists in database: ${s.site_name}`
                            });
                            return false;
                        }
                        return true;
                    });
                }

                if (failedRows.length > 0) {
                    console.warn("Upload aborted. The following rows are invalid:");
                    console.table(failedRows);
                    alert(`Upload failed. ${failedRows.length} row(s) are invalid. Please check the console for details and re-upload.`);
                    setShowUploadModal(false);
                    setErrorMessage("Upload failed. Please check the console for details.");
                    loadingBar.current.complete();
                    setLoading(false);
                    return;
                }

                // Proceed to upload valid data
                const chunkSize = 1000;
                let totalInserted = 0;
            
                for (let i = 0; i < formattedData.length; i += chunkSize) {
                    const chunk = formattedData.slice(i, i + chunkSize);
                    const response = await axios.post(
                        "http://localhost:5000/upload-sites", 
                        { sites: chunk }
                    );
                    totalInserted += response.data.inserted || 0;
                    loadingBar.current.staticStart((i + 1) * (100 / formattedData.length));
                }

                setSuccessMessage(`${totalInserted} record(s) uploaded successfully.`);
                    if (skippedRows.length > 0) {
                    console.warn("Skipped rows due to duplicate in Excel:", skippedRows);
                }

                fetchSites(searchQuery, currentPage, itemsPerPage);
                setShowUploadModal(false);
                setLoading(false);
                loadingBar.current.complete();

            } catch (error) {
                console.error("Error uploading file:", error);
                setErrorMessage(error.response?.data?.message || "Failed to upload location data.");
                loadingBar.current.complete();
                setLoading(false);
            }
        }
    }

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchQuery(value);
        setCurrentPage(1);
        fetchSites(value, 1, itemsPerPage);
    }

    const handleItemsPerPageChange = (e) => {
      setItemsPerPage(Number(e.target.value));
      setCurrentPage(1);
    }

    const openModal = (site = { site_id: null, site_code: "", site_name: "", region_id: "" }) => {
        setIsEditing(site.site_id ? true : false);
        setCurrentSites(site);
        setSelectedRegion(
            regions.find(region => region.region_name === site.region_name)?.region_id || ""
        );
        setShowModal(true);
    }

    const openDeleteModal = (site) => {
        setCurrentSites(site);
        setShowDeleteModal(true);
    }

    const handleSave = (e) => {
        e.preventDefault();

        const updatedSite = {
            site_code: currentSites.site_code.trim(),
            site_name: currentSites.site_name.trim(),
            region_id: selectedRegion
        }

        if (isEditing) {
            axios.put(`http://localhost:5000/update-sites/${currentSites.site_id}`, updatedSite)
                .then((response) => {
                    setSuccessMessage(response.data.message || "Site updated successfully.");
                    fetchSites(searchQuery, currentPage, itemsPerPage);
                    setShowModal(false);
                    loadingBar.current.complete();
                })
                .catch((error) => {
                    console.error("Error updating site:", error);
                    setErrorMessage(error.response?.data?.message || "Failed to update site.");
                    setShowModal(false);
                    loadingBar.current.complete();
                });
        } else {
            axios.post("http://localhost:5000/register-sites", updatedSite)
                .then((response) => {
                    setSuccessMessage(response.data.message || "Site registered successfully.");
                    fetchSites(searchQuery, currentPage, itemsPerPage);
                    setShowModal(false);
                    loadingBar.current.complete();
                })
                .catch((error) => {
                    console.error("Error registering site:", error);
                    setErrorMessage(error.response?.data?.message || "Failed to register site.");
                    setShowModal(false);
                    loadingBar.current.complete();
                });
        }
    }

    const handleDelete = () => {
        axios.delete(`http://localhost:5000/delete-sites/${currentSites.site_id}`)
            .then((response) => {
                setSuccessMessage(response.data.message || "Site deleted successfully.");
                fetchSites(searchQuery, currentPage, itemsPerPage);
                setShowDeleteModal(false);
                loadingBar.current.complete();
            })
            .catch((error) => {
                console.error("Error deleting site:", error);
                setErrorMessage(error.response?.data?.message || "Failed to delete site.");
                setShowDeleteModal(false);
                loadingBar.current.complete();
            });
    }

    const back = () => {
        navigate("/");
    }

    const totalPages = Math.ceil(totalSites / itemsPerPage);

    return (
        <div className="min-h-screen mx-auto p-4 bg-gray-300">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
                <h2 className="text-4xl text-left font-bold my-4">Manage Sites</h2>

                {/* Success Message */}
                {successMessage && (
                    <div className="flex items-center bg-green-500 text-white p-4 w-1/2 rounded my-4"> 
                        <FaCircleInfo className="text-xl mr-2" />
                        <span>{successMessage}</span>
                    </div>
                )}

                 {/* Error Message */}
                {errorMessage && (
                    <div className="flex bg-red-500 text-white p-4 w-1/2 rounded my-4 items-center"> 
                        <MdError className="text-xl mr-2" /> 
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Display Loading State */}
                <LoadingBar color="#2563eb" ref={loadingBar} height={3} />
                <>
                    {/* Search & Add */}
                    <div className="flex items-center justify-start mt-6 mb-6 space-x-6">
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search Site Code, Site Name, and Region"
                            value={searchQuery}
                            onChange={handleSearch}
                            className="border rounded py-2 px-3 w-1/2"
                        />

                        {/* Add Button */}
                        <button
                            onClick={() => openModal()}
                            className="flex items-center bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                        >
                            <FaPlus className="mr-2" />
                            <span>Add</span>
                        </button>

                        {/* Upload Button */}
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                        >
                            <FaFileUpload className="mr-2" />
                            <span>Upload</span>
                        </button>

                        {/* Back Button */}
                        <button
                            onClick = {back}
                            className = "flex items-center bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                        >
                            <IoMdArrowRoundBack className="mr-2" />
                            <span>Back</span>
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white border border-gray-400 border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-md leading-normal">
                                    <th className="py-3 px-6 text-left border border-gray-400">ID</th>
                                    <th className="py-3 px-6 text-left border border-gray-400">Site Code</th>
                                    <th className="py-3 px-6 text-left border border-gray-400">Site Name</th>
                                    <th className="py-3 px-6 text-left border border-gray-400">Region</th>
                                    <th className="py-3 px-6 text-left border border-gray-400"></th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-md">
                                {sites.map((site) => (
                                    <tr key={site.site_id} className="hover:bg-gray-100">
                                        <td className="py-3 px-6 text-left border border-gray-400">{site.site_id}</td>
                                        <td className="py-3 px-6 text-left border border-gray-400">{site.site_code}</td>
                                        <td className="py-3 px-6 text-left border border-gray-400">{site.site_name}</td>
                                        <td className="py-3 px-6 text-left border border-gray-400">{site.region_name}</td>
                                        <td className="py-3 px-6 text-left border border-gray-400">
                                            <button
                                                onClick={() => openModal(site)}
                                                className="text-blue-500 mr-2"
                                                >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(site)}
                                                className="text-red-500"
                                                >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>  
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                            <div className="p-5 border w-96 shadow-lg rounded-md bg-white">
                                <h3 className="text-lg text-center font-bold leading-6 text-gray-900 mb-4">
                                    {currentSites.site_id ? "Edit Site" : "Add Site"}
                                </h3>
                                <form onSubmit={handleSave}>
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-md mb-2">
                                            Site Code:
                                        </label>
                                        <input
                                            type="text"
                                            value={currentSites.site_code}
                                            onChange={(e) => setCurrentSites({ ...currentSites, site_code: e.target.value })}
                                            className="shadow border rounded py-2 px-3 w-full text-gray-700"
                                            required
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-md mb-2">
                                            Site Name:
                                        </label>
                                        <input
                                            type="text"
                                            value={currentSites.site_name}
                                            onChange={(e) => setCurrentSites({ ...currentSites, site_name: e.target.value })}
                                            className="shadow border rounded py-2 px-3 w-full text-gray-700"
                                            required
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-md mb-2">
                                            Select Region:
                                        </label>
                                        <select
                                            value={selectedRegion}
                                            onChange={(e) => setSelectedRegion(parseInt(e.target.value, 10))}
                                            className="shadow border rounded py-2 px-3 w-full text-gray-700"
                                            required
                                        >
                                            <option value="" disabled>Select Region</option>
                                            {regions.map((region) => (
                                                <option key={region.region_id} value={region.region_id}>
                                                    {region.region_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <button
                                            type="submit"
                                            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                     {/* Upload Modal */}
                    {showUploadModal && (
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                            <div className="p-5 border w-96 shadow-lg rounded-md bg-white">
                                <h3 className="text-lg text-center font-bold leading-6 text-gray-900 mb-10">
                                    Upload Sites
                                </h3>

                                <div className="mb-6">
                                    <label className="block text-gray-700 text-md mb-2">Upload File (Excel)</label>
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={handleUploadFileChange}
                                        className="shadow border rounded py-2 px-3 w-full text-gray-700"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={handleUploadSubmit}
                                        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                                    >
                                        Upload
                                    </button>
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="bg-blue-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                        <div className="p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg text-center font-bold leading-6 text-gray-900 mb-10">
                            Are you sure want to delete <span className="text-black">{currentSites.site_name}</span> row?
                        </h3>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleDelete}
                                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                            >
                            Confirm
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                            >
                            Cancel
                            </button>
                        </div>
                        </div>
                    </div>
                    )}

                    {/* Pagination */}
                    <div className="w-2/3 ml-15 flex justify-between items-center mt-4 pt-3 px-4">
                        {/* Rows per page dropdown */}
                        <div className="flex items-center">
                            <span className="text-gray-600 text-md mr-2">Rows per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="border rounded px-2 py-1 text-md"
                            >
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>

                        {/* Page indicator */}
                        <span className="text-gray-600 text-md">
                            {`${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalSites)} of ${totalSites}`}
                        </span>

                        {/* Navigation buttons */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className={`text-gray-600 hover:text-black ${
                                currentPage === 1 ? "opacity-100 cursor-not-allowed" : ""
                                }`}
                            >
                                <FaAngleDoubleLeft />
                            </button>

                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`text-gray-600 hover:text-black ${
                                currentPage === 1 ? "opacity-100 cursor-not-allowed" : ""
                                }`}
                            >
                                <FaAngleLeft />
                            </button>

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`text-gray-600 hover:text-black ${
                                currentPage === totalPages ? "opacity-100 cursor-not-allowed" : ""
                                }`}
                            >
                                <FaAngleRight />
                            </button>

                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className={`text-gray-600 hover:text-black ${
                                currentPage === totalPages ? "opacity-100 cursor-not-allowed" : ""
                                }`}
                            >
                                <FaAngleDoubleRight />
                            </button>
                        </div>

                        {/* Loading Overlay */}
                        {loading && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                            <div className="bg-white rounded-lg p-6 flex items-center space-x-4 shadow-xl">
                                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-gray-700 font-medium">Uploading...</span>
                            </div>
                            </div>
                        )}
                    </div>
                </>
            </div>
        </div>
    )
}

export default ManageSites;