import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { FaCircleInfo } from "react-icons/fa6";
import { IoMdArrowRoundBack } from "react-icons/io";
import LoadingBar from 'react-top-loading-bar';
import { useRef } from 'react';

const ManageRegions = () => {
    const [regions, setRegions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalRegions, setTotalRegions] = useState(0);
    const [currentRegions, setCurrentRegions] = useState({
        region_id: null, 
        region_name: ""
    });

    const navigate = useNavigate();
    const loadingBar = useRef(null);

    useEffect(() => {
        fetchRegions(searchQuery, currentPage, itemsPerPage);
    }, [searchQuery, currentPage, itemsPerPage]);

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
                setErrorMessage("");
            }, 3000);

            return () => clearTimeout(timer);
        }   
    }, [successMessage, errorMessage]);

    const fetchRegions = async (query = "", page = 1, limit = itemsPerPage) => {
        try{
            loadingBar.current.continuousStart();
            const response = await axios.get("http://localhost:5000/manage-regions", {
                params: { q: query, page, limit } 
            });

            if (response.data && response.data.regions) {
                const sortedRegions = [...response.data.regions].sort((a, b) => a.region_id - b.region_id);
                setRegions(sortedRegions);
                setTotalRegions(response.data.total || sortedRegions.length);
            } else {
                setRegions([]);
                setTotalRegions(0);
            }

        } catch (error) {
            console.error("Error fetching regions:", error);
            setErrorMessage("Failed to fetch regions. Please try again later.");
        } finally {
            loadingBar.current.complete();
        }
    }

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchQuery(value);
        setCurrentPage(1);
        fetchRegions(value, 1, itemsPerPage);
    }

    const handleItemsPerPageChange = (e) => {
      setItemsPerPage(Number(e.target.value));
      setCurrentPage(1);
    }

    const openModal = (region = { region_id: null, region_name: ""}) => {
        setIsEditing(region.region_id ? true : false);
        setCurrentRegions(region);
        setShowModal(true);
    }

    const openDeleteModal = (region) => {
        setCurrentRegions(region);
        setShowDeleteModal(true);
    }

    const handleSave = (e) => {
        e.preventDefault();

        const updatedRegions = {
            region_name: currentRegions.region_name.trim()
        }

        if (isEditing) {
            axios.put(`http://localhost:5000/update-regions/${currentRegions.region_id}`, updatedRegions)
                .then((response) => {
                    setSuccessMessage(response.data.message || "Region updated successfully.");
                    fetchRegions(searchQuery, currentPage, itemsPerPage);
                    setShowModal(false);
                    loadingBar.current.complete();
                })
                .catch((error) => {
                    console.error("Error updating region:", error);
                    setErrorMessage(error.response?.data?.message || "Failed to update region.");
                    setShowModal(false);
                    loadingBar.current.complete();
                });
        } else {
            axios.post("http://localhost:5000/register-regions", updatedRegions)
                .then((response) => {
                    setSuccessMessage(response.data.message || "Region registered successfully.");
                    fetchRegions(searchQuery, currentPage, itemsPerPage);
                    setShowModal(false);
                    loadingBar.current.complete();
                })
                .catch((error) => {
                    console.error("Error registering region:", error);
                    setErrorMessage(error.response?.data?.message || "Failed to register region.");
                    setShowModal(false);
                    loadingBar.current.complete();
                });
        }
    }

    const handleDelete = () => {
        axios.delete(`http://localhost:5000/delete-regions/${currentRegions.region_id}`)
            .then((response) => {
                setSuccessMessage(response.data.message || "Region deleted successfully.");
                fetchRegions(searchQuery, currentPage, itemsPerPage);
                setShowDeleteModal(false);
                loadingBar.current.complete();
            })
            .catch((error) => {
                console.error("Error deleting region:", error);
                setErrorMessage(error.response?.data?.message || "Failed to delete region.");
                setShowDeleteModal(false);
                loadingBar.current.complete();
            });
    }

    const back = () => {
        navigate("/");
    }

    const totalPages = Math.ceil(totalRegions / itemsPerPage);

    return (
        <div className="min-h-screen mx-auto p-4 bg-gray-300">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
                <h2 className="text-4xl text-left font-bold my-4">Manage Regions</h2>

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
                            placeholder="Search Region Name"
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
                                    <th className="py-3 px-6 text-left border border-gray-400">Region Name</th>
                                    <th className="py-3 px-6 text-left border border-gray-400"></th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-md">
                                {regions.map((region) => (
                                    <tr key={region.region_id} className="hover:bg-gray-100">
                                        <td className="py-3 px-6 text-left border border-gray-400">{region.region_id}</td>
                                        <td className="py-3 px-6 text-left border border-gray-400">{region.region_name}</td>
                                        <td className="py-3 px-6 text-left border border-gray-400">
                                            <button
                                                onClick={() => openModal(region)}
                                                className="text-blue-500 mr-2"
                                                >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(region)}
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
                                    {currentRegions.region_id ? "Edit Region" : "Add Region"}
                                </h3>
                                <form onSubmit={handleSave}>
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-md mb-2">
                                            Region Name:
                                        </label>
                                        <input
                                            type="text"
                                            value={currentRegions.region_name}
                                            onChange={(e) => setCurrentRegions({ ...currentRegions, region_name: e.target.value })}
                                            className="shadow border rounded py-2 px-3 w-full text-gray-700"
                                            required
                                        />
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

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                        <div className="p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg text-center font-bold leading-6 text-gray-900 mb-10">
                            Are you sure want to delete <span className="text-black">{currentRegions.region_name}</span> row?
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
                            {`${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalRegions)} of ${totalRegions}`}
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
                    </div>
                </>
            </div>
        </div>
    )
}

export default ManageRegions;