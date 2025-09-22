import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './PaymentCanceled.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function PaymentCanceled({ onCountChange }) {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoiceDetails, setInvoiceDetails] = useState({});
    const [expandedInvoice, setExpandedInvoice] = useState(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            const deviceName = localStorage.getItem('deviceName') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';
            const token = localStorage.getItem('token') || '';
            const userID = localStorage.getItem('userID') || '';

            const requestData = {
                customerID: userID,
                employeeID: null,
                invoiceID: null,
                invoiceType: 'Output',
                status: 'Fail',
                startDate: null,
                endDate: null,
            };

            const headers = {
                'Content-Type': 'application/json',
                DeviceName: deviceName,
                RefreshToken: refreshToken,
                Authorization: token ? `Bearer ${token}` : '',
                UserID: userID,
            };

            try {
                const response = await fetch('http://buitoan.somee.com/api/Invoice/GetList_SearchInvoice', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    throw new Error('Lỗi khi gọi API');
                }

                const result = await response.json();
                const invoiceList = result.data || [];
                setInvoices(invoiceList);
                onCountChange(invoiceList.length); // Pass the count to the parent
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [onCountChange]); // Add onCountChange to dependency array

    const fetchInvoiceDetails = async (invoiceID) => {
        const requestData = {
            invoiceID: invoiceID,
            invoiceDetailType: null,
            startDate: null,
            endDate: null,
        };

        const headers = {
            'Content-Type': 'application/json',
            DeviceName: localStorage.getItem('deviceName') || '',
            RefreshToken: localStorage.getItem('refreshToken') || '',
            Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
            UserID: localStorage.getItem('userID') || '',
        };

        try {
            const response = await fetch('http://buitoan.somee.com/api/Invoice/GetList_SearchInvoiceDetail', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error('Lỗi khi gọi API chi tiết hóa đơn');
            }

            const result = await response.json();
            setInvoiceDetails((prev) => ({
                ...prev,
                [invoiceID]: result.data || [],
            }));
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
        }
    };

    const handleToggleDetails = (invoiceID) => {
        if (expandedInvoice === invoiceID) {
            setExpandedInvoice(null);
        } else {
            setExpandedInvoice(invoiceID);
            if (!invoiceDetails[invoiceID]) {
                fetchInvoiceDetails(invoiceID);
            }
        }
    };

    if (loading) {
        return <div className={cx('loading')}>Đang tải...</div>;
    }

    if (error) {
        return <div className={cx('error')}>Lỗi: {error}</div>;
    }

    return (
        <div className={cx('payment-canceled')}>
            <h2>Hóa đơn đã hủy thanh toán</h2>
            {invoices.length === 0 ? (
                <p>Không có hóa đơn nào đã hủy thanh toán.</p>
            ) : (
                <div className={cx('table-wrapper')}>
                    <table className={cx('invoice-table')}>
                        <thead>
                            <tr>
                                <th>Mã Hóa Đơn</th>
                                <th>Khách Hàng</th>
                                <th>Giảm Giá</th>
                                <th>Tổng Tiền</th>
                                <th>Thanh Toán</th>
                                <th>Ngày Tạo</th>
                                <th>Trạng Thái</th>
                                <th>Chi Tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <React.Fragment key={invoice.invoiceID}>
                                    <tr>
                                        <td>{invoice.invoiceID}</td>
                                        <td>{invoice.customerName}</td>
                                        <td>{invoice.discountValue}%</td>
                                        <td>{invoice.totalMoney.toLocaleString('vi-VN')} đ</td>
                                        <td>{invoice.totalAmountAfterDiscount.toLocaleString('vi-VN')} đ</td>
                                        <td>{new Date(invoice.dateCreated).toLocaleString('vi-VN')}</td>
                                        <td>{invoice.status}</td>
                                        <td>
                                            <FontAwesomeIcon
                                                icon={faCaretDown}
                                                className={cx('caret-icon')}
                                                onClick={() => handleToggleDetails(invoice.invoiceID)}
                                            />
                                        </td>
                                    </tr>
                                    {expandedInvoice === invoice.invoiceID && invoiceDetails[invoice.invoiceID] && (
                                        <tr>
                                            <td colSpan="8">
                                                <div className={cx('detail-table-wrapper')}>
                                                    <table className={cx('detail-table')}>
                                                        <thead>
                                                            <tr>
                                                                <th>Loại</th>
                                                                <th>Tên</th>
                                                                <th>Giá</th>
                                                                <th>Số Lượng</th>
                                                                <th>Tổng Tiền</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {invoiceDetails[invoice.invoiceID].map((detail) => (
                                                                <React.Fragment key={detail.invoiceDetailID}>
                                                                    {detail.productName && (
                                                                        <tr>
                                                                            <td>Sản phẩm</td>
                                                                            <td>{detail.productName}</td>
                                                                            <td>
                                                                                {detail.priceProduct.toLocaleString(
                                                                                    'vi-VN',
                                                                                )}{' '}
                                                                                đ
                                                                            </td>
                                                                            <td>{detail.totalQuantityProduct}</td>
                                                                            <td>
                                                                                {(
                                                                                    detail.priceProduct *
                                                                                    detail.totalQuantityProduct
                                                                                ).toLocaleString('vi-VN')}{' '}
                                                                                đ
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                    {detail.serviceName && (
                                                                        <tr>
                                                                            <td>Dịch vụ</td>
                                                                            <td>{detail.serviceName}</td>
                                                                            <td>
                                                                                {detail.priceService.toLocaleString(
                                                                                    'vi-VN',
                                                                                )}{' '}
                                                                                đ
                                                                            </td>
                                                                            <td>{detail.totalQuantityService}</td>
                                                                            <td>
                                                                                {(
                                                                                    detail.priceService *
                                                                                    detail.totalQuantityService
                                                                                ).toLocaleString('vi-VN')}{' '}
                                                                                đ
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default PaymentCanceled;
