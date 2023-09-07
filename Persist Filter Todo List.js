function getAllTodoElements() {
    return document.querySelectorAll('#todoList > li');
}

function isMatchStatus(liElement, filterStatus) {
    return filterStatus === 'all' || liElement.dataset.status === filterStatus;
}

function isMatchSearch(liElement, searchTerm) {
    if (!liElement) return false;

    // searchTerm === empty -> show all
    // searchTerm !== empty -> filter todo
    if (searchTerm === '') return true; //chac chan match

    const titleElement = liElement.querySelector('p.todo__title');
    if (!titleElement) return false;

    return titleElement.textContent.toLowerCase().includes(searchTerm.toLowerCase());
}

function isMatch(liElement, params) {
    return (
        isMatchSearch(liElement, params.get('searchTerm')) &&
        isMatchStatus(liElement, params.get('status'))
    );
}

// function searchTodo(searchTerm) {
//     const todoElementList = getAllTodoElements();
//     for (const todoElement of todoElementList) {
//         const needToShow = isMatch(todoElement, searchTerm);

//         todoElement.hidden = !needToShow; //true/false
//     }
// }

function initSearchInput() {
    // find search term input
    const searchInput = document.getElementById('searchTerm');
    if (!searchInput) return;

    // attach change event (khi gõ gõ sẽ thay đổi sử kiện)
    searchInput.addEventListener('input', () => {
        //trigger change event thay đổi khi click ra ngoài hoặc enter
        //trigger input event thay đổi ngay lập tức
        // searchTodo(searchInput.value);

        handleFilterChange('searchTerm', searchInput.value);
    });
}

function handleFilterChange(filterName, filterValue) {
    //update query params
    const url = new URL(window.location);
    url.searchParams.set(filterName, filterValue);
    history.pushState({}, '', url); //lưu lại thông tin filter trên url -> reload hoặc truy cập lại lấy thông tin từ đây render lại

    const todoElementList = getAllTodoElements();
    for (const todoElement of todoElementList) {
        const needToShow = isMatch(todoElement, url.searchParams);
        todoElement.hidden = !needToShow; //true/false
    }
}

// function filterTodo(filterStatus) {
//     const todoElementList = getAllTodoElements();

//     for (const todoElement of todoElementList) {
//         const needToShow = filterStatus === 'all' || todoElement.dataset.status === filterStatus;
//         todoElement.hidden = !needToShow; //true/false
//     }
// }

function initFilterStatus() {
    // find select
    const filterStatusSelect = document.getElementById('filterStatus');
    if (!filterStatusSelect) return;

    //attach event change
    filterStatusSelect.addEventListener('change', () => {
        // console.log('status change', filterStatusSelect.value);
        // filterTodo(filterStatusSelect.value);

        handleFilterChange('status', filterStatusSelect.value);
    });
}

// main: iffy
(() => {
    initSearchInput();
    initFilterStatus();
})();
