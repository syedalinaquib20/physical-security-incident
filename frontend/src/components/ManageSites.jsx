import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight, FaFileUpload, FaFileExport } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { FaCircleInfo } from "react-icons/fa6";
import { IoMdArrowRoundBack } from "react-icons/io";
import LoadingBar from 'react-top-loading-bar';

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
        sites_id: null, 
        site_code: "",
        site_name: ""
    });

    const navigate = useNavigate();
    const loadingBar = useRef(null);

    useEffect(() => {
        fetchSites(searchQuery, currentPage, itemsPerPage);
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

}

export default ManageSites;