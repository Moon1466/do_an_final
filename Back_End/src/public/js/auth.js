// Hàm hiển thị toast message
function showToast(message, type = 'error') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const toastMessage = toast.querySelector('.toast__message');
    if (toastMessage) {
        toastMessage.textContent = message;
    }

    // Thêm class để hiển thị toast
    toast.classList.add('show');
    toast.classList.add(`toast--${type}`);

    // Tự động ẩn toast sau 3 giây
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.remove(`toast--${type}`);
        
        // Nếu là lỗi quyền truy cập, chuyển hướng về trang chủ
        if (type === 'error' && message.includes('không có quyền')) {
            window.location.href = '/home';
        }
    }, 3000);
}

// Xử lý lỗi từ response
function handleAuthError(response) {
    if (!response.ok) {
        response.json().then(data => {
            showToast(data.message || 'Có lỗi xảy ra', 'error');
        });
        return false;
    }
    return true;
}

// Thêm interceptor cho tất cả các request
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý các response có status 403 (Forbidden)
    const originalFetch = window.fetch;
    window.fetch = function() {
        return originalFetch.apply(this, arguments)
            .then(response => {
                if (response.status === 403) {
                    return response.json().then(data => {
                        showToast(data.message || 'Bạn không có quyền truy cập', 'error');
                        throw new Error('Unauthorized');
                    });
                }
                return response;
            });
    };
}); 