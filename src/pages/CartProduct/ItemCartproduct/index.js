import React, { useEffect, useState } from 'react';
import styles from './ItemCartproduct.module.scss';
import classNames from 'classnames/bind';
import SuccessMessage from '~/components/Layout/DefaultLayout/Header/SuccessMessage';
import { useDebounce } from '~/hooks';

const cx = classNames.bind(styles);

function CartItem({ item, onQuantityChange, onDelete, onAddToInvoice }) {
    const [quantity, setQuantity] = useState(item.quantity);
    const debouncedQuantity = useDebounce(quantity, 500);

    useEffect(() => {
        if (debouncedQuantity !== item.quantity) {
            onQuantityChange(item.cartProductID, debouncedQuantity);
        }
    }, [debouncedQuantity, item.cartProductID, item.quantity, onQuantityChange]);

    const handleIncrease = () => setQuantity(quantity + 1);
    const handleDecrease = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    return (
        <div className={cx('cart-item')}>
            <img
                src={`https://buitoan.somee.com/Images/${item.productImages}`}
                alt={item.productName}
                className={cx('item-image')}
            />
            <div className={cx('item-details')}>
                <h2 className={cx('item-name')}>{item.productName}</h2>
                <p className={cx('item-price')}>{item.sellingPrice.toLocaleString()} VND</p>
                <div className={cx('quantity-control')}>
                    <button className={cx('quantity-decrease')} onClick={handleDecrease} disabled={quantity <= 1}>
                        −
                    </button>
                    <span className={cx('item-quantity')}>{quantity}</span>
                    <button className={cx('quantity-increase')} onClick={handleIncrease}>
                        +
                    </button>
                </div>
                <div className={cx('btn-Submid')}>
                    <button className={cx('delete-button')} onClick={() => onDelete(item.cartProductID)}>
                        Xóa
                    </button>
                    <button className={cx('payment-button')} onClick={() => onAddToInvoice(item)}>
                        Thanh Toán
                    </button>
                </div>
            </div>
        </div>
    );
}

function ItemCartproduct({ onAddToInvoice, onCheckoutAll }) {
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [successMessage, setSuccessMessage] = useState(null);
    const userID = localStorage.getItem('userID') || '';

    useEffect(() => {
        if (!userID) {
            alert('Bạn cần đăng nhập để xem giỏ hàng.');
            return;
        }

        const fetchCartItems = async () => {
            const deviceName = localStorage.getItem('deviceName') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';
            const token = localStorage.getItem('token') || '';

            const headers = {
                'Content-Type': 'application/json',
                DeviceName: deviceName,
                RefreshToken: refreshToken,
                Authorization: token ? `Bearer ${token}` : '',
                UserID: userID,
            };

            const requestData = { userID };

            try {
                const response = await fetch('https://buitoan.somee.com/api/CartProduct/GetList_SearchCartProduct', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) throw new Error('Lỗi khi lấy dữ liệu giỏ hàng');

                const result = await response.json();
                if (result.data) {
                    setCartItems(result.data);
                    calculateTotalPrice(result.data);
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu giỏ hàng:', error);
            }
        };

        fetchCartItems();
    }, [userID]);

    const calculateTotalPrice = (items) => {
        const total = items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
        setTotalPrice(total);
    };

    const handleDeleteItem = async (cartProductID) => {
        const deviceName = localStorage.getItem('deviceName') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';
        const token = localStorage.getItem('token') || '';

        const headers = {
            'Content-Type': 'application/json',
            DeviceName: deviceName,
            RefreshToken: refreshToken,
            Authorization: token ? `Bearer ${token}` : '',
            UserID: userID,
        };

        const requestData = {
            cartProductID: cartProductID,
        };

        try {
            const response = await fetch('https://buitoan.somee.com/api/CartProduct/Delete_CartProduct', {
                method: 'DELETE',
                headers,
                body: JSON.stringify(requestData),
            });

            if (!response.ok) throw new Error('Lỗi khi xóa sản phẩm');

            const updatedItems = cartItems.filter((item) => item.cartProductID !== cartProductID);
            setCartItems(updatedItems);
            calculateTotalPrice(updatedItems);
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
        }
    };

    const handleUpdateQuantity = async (cartProductID, newQuantity) => {
        const deviceName = localStorage.getItem('deviceName') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';
        const token = localStorage.getItem('token') || '';

        const headers = {
            'Content-Type': 'application/json',
            DeviceName: deviceName,
            RefreshToken: refreshToken,
            Authorization: token ? `Bearer ${token}` : '',
            UserID: userID,
        };

        const requestData = {
            cartProductID,
            quantity: newQuantity,
        };

        try {
            const response = await fetch('https://buitoan.somee.com/api/CartProduct/Update_CartProduct', {
                method: 'POST',
                headers,
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

            setSuccessMessage(data.returnMessage || data.resposeMessage);
            setTimeout(() => setSuccessMessage(null), 3000);

            if (!response.ok) throw new Error('Lỗi khi cập nhật số lượng');

            const updatedItems = cartItems.map((item) =>
                item.cartProductID === cartProductID ? { ...item, quantity: newQuantity } : item,
            );
            setCartItems(updatedItems);
            calculateTotalPrice(updatedItems);
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng:', error);
        }
    };

    return (
        <div className={cx('cart-container')}>
            {successMessage && <SuccessMessage message={successMessage} />}
            {cartItems.length === 0 ? (
                <p>Giỏ hàng của bạn đang trống.</p>
            ) : (
                <>
                    <div className={cx('cart-items')}>
                        {cartItems.map((item) => (
                            <CartItem
                                key={item.cartProductID}
                                item={item}
                                onQuantityChange={handleUpdateQuantity}
                                onDelete={handleDeleteItem}
                                onAddToInvoice={onAddToInvoice}
                            />
                        ))}
                    </div>
                    <div className={cx('cart-summary')}>
                        <h2 className={cx('totalmoney')}>Tổng Tiền Giỏ Hàng: {totalPrice.toLocaleString()} VND</h2>
                        <button className={cx('checkout-button')} onClick={() => onCheckoutAll(cartItems)}>
                            Thanh Toán Tất Cả
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ItemCartproduct;
