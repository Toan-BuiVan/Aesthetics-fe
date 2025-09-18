import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import axios from 'axios';

import styles from './MenuItem.Module.scss';

const cx = classNames.bind(styles);

function MenuItem() {
    const [servicesById, setServicesById] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const menuItems = [
        { name: 'Trang Chủ', id: null, href: '/' },
        {
            name: 'Giới Thiệu',
            id: null,
            subItems: [
                { name: 'Công nghệ', href: '#section-content' },
                { name: 'Câu chuyện', href: '#section-relative' },
                { name: 'Khuyến mãi', href: '#section-sales' },
                { name: 'Tin Tức', href: '#setion-tintuc' },
                { name: 'Đánh Giá', href: '#section-nhan-xet' },
            ],
        },
        { name: 'Da Liễu', id: 3, href: '/servicesPage' },
        { name: 'Nha Khoa', id: 7, href: '/servicesPage' },
        { name: 'Phẫu Thuật Phẩm Mỹ', id: 1, href: '/servicesPage' },
        { name: 'Bảng Giá', id: null, href: '/servicesPage' },
        { name: 'Sản Phẩm', id: null, href: '/productsPage' },
    ];

    useEffect(() => {
        const fetchAllServices = async () => {
            try {
                const response = await axios.post('http://localhost:5262/api/Servicess/GetList_SearchServicess', {
                    serviceID: null,
                    serviceName: null,
                    productsOfServicesID: null,
                });
                const allServices = response.data;

                // Tạo servicesById từ allServices
                const servicesById = {};
                menuItems.forEach((item) => {
                    if (item.id !== null) {
                        servicesById[item.id] = allServices.filter(
                            (service) => service.productsOfServicesID === item.id,
                        );
                    }
                });

                setServicesById(servicesById);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải dịch vụ');
                setLoading(false);
            }
        };
        fetchAllServices();
    }, []);

    const toggleMenu = () => {
        setIsMenuVisible(!isMenuVisible);
    };

    const handleNavigation = (href) => {
        window.location.href = href;
    };

    const specificServiceIds = [1, 3, 4, 5, 6, 7, 8];

    const renderServices = (item) => {
        const isSpecificService = specificServiceIds.includes(item.id) || item.name === 'Sản Phẩm';
        if (item.subItems) {
            return item.subItems.map((subItem, index) => (
                <li key={index} className={cx('respone-item')}>
                    <a href={subItem.href}>{subItem.name}</a>
                </li>
            ));
        } else if (item.id && servicesById[item.id]?.length > 0) {
            const services = servicesById[item.id];
            if (loading)
                return <li className={cx('respone-item', { 'specific-service': isSpecificService })}>Đang tải...</li>;
            if (error)
                return <li className={cx('respone-item', { 'specific-service': isSpecificService })}>{error}</li>;
            if (services.length <= 8) {
                return services.map((service, index) => (
                    <li
                        key={index}
                        className={cx('respone-item', { 'specific-service': isSpecificService })}
                        onClick={() => handleNavigation('/servicesPage')}
                    >
                        {service.serviceName || `Dịch vụ ${index + 1}`}
                    </li>
                ));
            } else {
                const midPoint = Math.ceil(services.length / 2);
                const leftColumn = services.slice(0, midPoint);
                const rightColumn = services.slice(midPoint);
                return (
                    <div className={cx('columns')}>
                        <ul className={cx('column')}>
                            {leftColumn.map((service, index) => (
                                <li
                                    key={index}
                                    className={cx('respone-item', { 'specific-service': isSpecificService })}
                                    onClick={() => handleNavigation('/servicesPage')}
                                >
                                    {service.serviceName || `Dịch vụ ${index + 1}`}
                                </li>
                            ))}
                        </ul>
                        <ul className={cx('column')}>
                            {rightColumn.map((service, index) => (
                                <li
                                    key={index + midPoint}
                                    className={cx('respone-item', { 'specific-service': isSpecificService })}
                                    onClick={() => handleNavigation('/servicesPage')}
                                >
                                    {service.serviceName || `Dịch vụ ${index + midPoint + 1}`}
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            }
        }
        return null;
    };

    const midPoint = Math.ceil(menuItems.length / 2);
    const leftColumnItems = menuItems.slice(0, midPoint);
    const rightColumnItems = menuItems.slice(midPoint);

    return (
        <div className={cx('menu-Item', { show: isMenuVisible })}>
            <div className={cx('list-Div')} onClick={toggleMenu}>
                <FontAwesomeIcon icon={faList} />
            </div>
            <div className={cx('menu-items-container')}>
                <div className={cx('menu-column')}>
                    {leftColumnItems.map((item, index) => {
                        const isSpecificService = specificServiceIds.includes(item.id) || item.name === 'Sản Phẩm';
                        if (item.id || item.name === 'Sản Phẩm') {
                            return (
                                <div
                                    key={index}
                                    className={cx('menu-home-item')}
                                    onClick={() => handleNavigation(item.href || '/servicesPage')}
                                >
                                    <span className="menu-text">{item.name}</span>
                                    <ul className={cx('ul-item', { 'specific-service': isSpecificService })}>
                                        {renderServices(item)}
                                    </ul>
                                </div>
                            );
                        } else if (item.subItems) {
                            return (
                                <div key={index} className={cx('menu-home-item')}>
                                    <span className="menu-text">{item.name}</span>
                                    <ul className={cx('ul-item')}>{renderServices(item)}</ul>
                                </div>
                            );
                        } else {
                            return (
                                <a key={index} className={cx('menu-home-item')} href={item.href || '#'}>
                                    <span className="menu-text">{item.name}</span>
                                </a>
                            );
                        }
                    })}
                </div>

                <div className={cx('menu-column')}>
                    {rightColumnItems.map((item, index) => {
                        const isSpecificService = specificServiceIds.includes(item.id) || item.name === 'Sản Phẩm';
                        if (item.id || item.name === 'Sản Phẩm') {
                            return (
                                <div
                                    key={index + midPoint}
                                    className={cx('menu-home-item')}
                                    onClick={() => handleNavigation(item.href || '/servicesPage')}
                                >
                                    <span className="menu-text">{item.name}</span>
                                    <ul className={cx('ul-item', { 'specific-service': isSpecificService })}>
                                        {renderServices(item)}
                                    </ul>
                                </div>
                            );
                        } else if (item.subItems) {
                            return (
                                <div key={index + midPoint} className={cx('menu-home-item')}>
                                    <span className="menu-text">{item.name}</span>
                                    <ul className={cx('ul-item')}>{renderServices(item)}</ul>
                                </div>
                            );
                        } else {
                            return (
                                <a key={index + midPoint} className={cx('menu-home-item')} href={item.href || '#'}>
                                    <span className="menu-text">{item.name}</span>
                                </a>
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
}

export default MenuItem;
