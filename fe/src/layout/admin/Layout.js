import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../admin/layout.scss';

function Header({ children }) {
    const location = useLocation();

    const isActive = (pathname) => {
        for (var i = 0; i < pathname.length; i++) {
            if (location.pathname === pathname[i]) {
                return 'activenavbar';
            }
        }
        return '';
    };

    const [isCssLoaded, setCssLoaded] = useState(false);
    useEffect(() => {
        import('../admin/layout.scss').then(() => setCssLoaded(true));
    }, []);

    if (!isCssLoaded) {
        return <></>;
    }

    const usera = JSON.parse(window.localStorage.getItem("user") || "{}");

    const openClose = () => {
        document.getElementById("sidebar").classList.toggle("toggled");
        document.getElementById("page-content-wrapper").classList.toggle("toggled");
        document.getElementById("navbarmain").classList.toggle("navbarmainrom");
    };

    return (
        <div className="d-flex" id="wrapper">
            <nav id="sidebar" className="bg-dark text-white">
                <div className="sidebar-header p-3 text-white">
                    <i className="fa fa-bars pointer" id="iconbaradmin" onClick={openClose}></i>
                    ADMIN
                </div>
                <ul className="list-unstyled components">
                    <li className={isActive(["/admin/index"])}>
                        <Link to="/admin/thong-ke" className="text-white text-decoration-none">
                            <i className="fa fa-bar-chart me-2"></i> Thống kê
                        </Link>
                    </li>
                    <li className={isActive(["/admin/blog", "/admin/add-blog"])}>
                        <a href="#colblog" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle text-white text-decoration-none">
                            <i className="fa fa-newspaper"></i> Quản lý bài viết
                        </a>
                        <ul className="collapse list-unstyled childunl" id="colblog">
                            <li><a href='blog' className="text-decoration-none">Danh sách bài viết</a></li>
                            <li><a href='add-blog' className="text-decoration-none">Thêm bài viết</a></li>
                        </ul>
                    </li>
                    <li className={isActive(["/admin/category", "/admin/add-category"])}>
                        <a href="#colcate" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle text-white text-decoration-none">
                            <i className="fa fa-list"></i> Quản lý danh mục
                        </a>
                        <ul className="collapse list-unstyled childunl" id="colcate">
                            <li><a href='category' className="text-decoration-none">Danh sách danh mục</a></li>
                            <li><a href='add-category' className="text-decoration-none">Thêm danh mục</a></li>
                        </ul>
                    </li>
                    <li className={isActive(["/admin/product", "/admin/add-product"])}>
                        <a href="#colproduct" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle text-white text-decoration-none">
                        <i class="fas fa-tshirt"></i> Quản lý sản phẩm
                        </a>
                        <ul className="collapse list-unstyled childunl" id="colproduct">
                            <li><a href='product' className="text-decoration-none">Danh sách sản phẩm</a></li>
                            <li><a href='add-product' className="text-decoration-none">Thêm sản phẩm</a></li>
                        </ul>
                    </li>
                    <li className={isActive(["/admin/voucher", "/admin/add-voucher"])}>
                        <a href="#colvoucher" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle text-white text-decoration-none">
                        <i class="fa fa-ticket"></i> Quản lý voucher
                        </a>
                        <ul className="collapse list-unstyled childunl" id="colvoucher">
                            <li><a href='voucher' className="text-decoration-none">Danh sách voucher</a></li>
                            <li><a href='add-voucher' className="text-decoration-none">Thêm voucher</a></li>
                        </ul>
                    </li>
                    <li className={isActive(["/admin/banner"])}>
                        <a href="#colbanner" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle text-white text-decoration-none">
                        <i class="fas fa-image"></i> Quản lý banner
                        </a>
                        <ul className="collapse list-unstyled childunl" id="colbanner">
                            <li><a href='banner' className="text-decoration-none">Danh sách banner</a></li>
                        </ul>
                    </li>
                    <li className={isActive(["/admin/importproduct", "/admin/add-importproduct"])}>
                        <a href="#colimport" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle text-white text-decoration-none">
                        <i class="fa fa-file"></i> Quản lý nhập hàng
                        </a>
                        <ul className="collapse list-unstyled childunl" id="colimport">
                            <li><a href='importproduct' className="text-decoration-none">Danh sách nhập hàng</a></li>
                            <li><a href='add-importproduct' className="text-decoration-none">Thêm nhập hàng</a></li>
                        </ul>
                    </li>
                    <li>
                        <a href="don-hang" className="text-white text-decoration-none">
                            <i className="fas fa-list"></i> Đơn hàng
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={logout} className="text-white text-decoration-none">
                            <i className="fa fa-sign-out me-2"></i> Logout
                        </a>
                    </li>
                </ul>
            </nav>
            <div id="page-content-wrapper" class="w-100">
            <nav id='navbarmain' class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
                <div class="container-fluid">
                    <button class="btn btn-link" id="menu-toggle"><i class="fas fa-bars" onClick={openClose}></i></button>
                    <div class="dropdown ms-auto">
                    </div>
            
                    <div class="dropdown ms-3">
                        <a class="dropdown-toggle d-flex align-items-center text-decoration-none" href="#" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                         <span class="navbar-text me-2">Hello: {usera?.email}</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <li onClick={logout}><a class="dropdown-item" href="#">Logout</a></li>
    
                        </ul>
                    </div>
                </div>
            </nav>
            <div class="container-fluid py-4" id='mainpageadmin'>
                {children}
            </div>
        </div>
    </div>
    );
}


function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace('../login');
}

export default Header;
