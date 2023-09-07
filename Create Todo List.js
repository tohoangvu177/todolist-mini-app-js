// todo = { id: 1, title: 'Học HTML/CSS', status: 'pending' } -> <li data-id="1" data-status="pending"> Template </li>
function createTodoElement(todo) {
    if (!todo) return null;

    // find template
    const todoTemplate = document.querySelector('#todoTemplate');
    if (!todoTemplate) {
        alert("Can't find the Todo Template");
        return;
    }

    //1. clone li template
    // const todoElement = todoTemplate.content.querySelector('li').cloneNode(true);
    const todoElement = todoTemplate.content.firstElementChild.cloneNode(true);
    todoElement.dataset.id = todo.id;
    todoElement.dataset.status = todo.status;

    // 2. render current todo status
    const divAlertElement = todoElement.querySelector('div.todo');
    if (!divAlertElement) return null;

    const alertClass = todo.status === 'pending' ? 'alert-secondary' : 'alert-success';
    divAlertElement.classList.remove('alert-secondary'); //default status Alert of div is alert-secondary
    divAlertElement.classList.add(alertClass);

    // 2.1. render current 'mark-as-done' button
    const markAsDoneButton = todoElement.querySelector('button.mark-as-done');
    if (markAsDoneButton) {
        markAsDoneButton.textContent = todo.status === 'pending' ? 'Finish' : 'Reset';

        const buttonAlertElement = todo.status === 'pending' ? 'btn-dark' : 'btn-success';
        markAsDoneButton.classList.remove('btn-success'); //default
        markAsDoneButton.classList.add(buttonAlertElement);
    }

    // 3. update p tittle
    const titleElement = todoElement.querySelector('.todo__title');
    if (titleElement) titleElement.textContent = todo.title;

    //TODO: attach event to buttons

    // add click event for mark-as-done button
    // const markAsDoneButton = todoElement.querySelector('button.mark-as-done');
    if (markAsDoneButton) {
        markAsDoneButton.addEventListener('click', function () {
            // new status
            const currentStatus = todoElement.dataset.status;
            const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

            // get current todoList in localStorage
            // update status of current todo
            // save to local storage
            const todoList = getTodoList();
            const index = todoList.findIndex((x) => x.id === todo.id);
            if (index >= 0) {
                todoList[index].status = newStatus;
                localStorage.setItem('todo_list', JSON.stringify(todoList));
            }

            //update status from dom tree
            todoElement.dataset.status = newStatus;

            //update new alert
            const newDivAlert = currentStatus === 'pending' ? 'alert-success' : 'alert-secondary';
            divAlertElement.classList.remove('alert-secondary', 'alert-success');
            divAlertElement.classList.add(newDivAlert);

            //update content status of button
            markAsDoneButton.textContent = currentStatus === 'pending' ? 'Reset' : 'Finish';

            const newButtonAlert = currentStatus === 'pending' ? 'btn-success' : 'btn-dark';
            markAsDoneButton.classList.remove('btn-success', 'btn-dark');
            markAsDoneButton.classList.add(newButtonAlert);
        });
    }

    // add click event for remove button (Remove)
    const removeButton = todoElement.querySelector('button.remove');
    if (removeButton) {
        removeButton.addEventListener('click', () => {
            //get current todo list in local storage (get API)
            // where is the remove todo id
            //remove id want to remove

            // save from local storage
            const todoList = getTodoList();
            // console.log({todoList, removeId: todo.id });
            const newTodoList = todoList.filter((x) => x.id !== todo.id);
            localStorage.setItem('todo_list', JSON.stringify(newTodoList));

            // remove from dom tree
            todoElement.remove();
        });
    }

    //add click event for edit button
    const editButton = todoElement.querySelector('button.edit');
    if (editButton) {
        editButton.addEventListener('click', () => {
            // TODO: latest todo data - get form local storage
            // need to get todo from local storage
            const todoList = getTodoList();
            const latestTodo = todoList.find((x) => x.id === todo.id);
            if (!latestTodo) return;

            //populate data to todo form
            populateTodoForm(latestTodo);
        });
    }

    return todoElement;
}

function populateTodoForm(todo) {
    // query todo form
    // dataset.id =todo.id
    const todoForm = document.getElementById('todoFormId');
    if (!todoForm) return;
    todoForm.dataset.id = todo.id;

    // set values for form controls
    // set todoText input
    const todoInput = document.getElementById('todoText');
    if (todoInput) {
        todoInput.value = todo.title;
    }
}

function getTodoList() {
    try {
        return JSON.parse(localStorage.getItem('todo_list')) || [];
    } catch {
        return [];
    }
}

function renderTodoList(ulElementById, todoList) {
    // check todoList
    if (!Array.isArray || todoList.length === 0) return;

    // find/check ul element in Dom
    const ulElement = document.querySelector('#todoList');
    if (!ulElement) return;

    // loop though todoList
    for (const todo of todoList) {
        // 1,2 -> function createTodoElement(todo)

        const liElement = createTodoElement(todo);
        // 3.Add li to Dom tree (add ul to li)
        ulElement.appendChild(liElement);
    }
}

function handleTodoFormSubmit(event) {
    event.preventDefault(); //prevent submit reload the page

    const todoForm = document.getElementById('todoFormId');
    if (!todoForm) return;

    // get form values (query directly to id input or query form>input.name tag)
    const todoInput = document.getElementById('todoText');
    if (!todoInput) return;

    //validate form values (data input by users is correct)

    // determine add new or edit mode

    const isEdit = Boolean(todoForm.dataset.id);

    if (isEdit) {
        //// edit mode
        //find current todo
        const todoList = getTodoList();
        const index = todoList.findIndex((x) => x.id.toString() === todoForm.dataset.id); //dataset kieu du lieu la string
        if (index < 0) return;

        //update content
        todoList[index].title = todoInput.value;

        //save
        localStorage.setItem('todo_list', JSON.stringify(todoList));

        //apply DOM changes
        //find li element having id = todoForm.dataset.id
        const liElement = document.querySelector(
            `ul#todoList > li[data-id = "${todoForm.dataset.id}"]`,
        );
        if (liElement) {
            // liElement.textContent = todoInput.value;
            const titleElement = liElement.querySelector('.todo__title');
            if (titleElement) titleElement.textContent = todoInput.value;
        }
    } else {
        //// add mode
        const newTodo = { id: Date.now(), title: todoInput.value, status: 'pending' };

        // save to Local Storage
        const todoList = getTodoList();
        todoList.push(newTodo);
        localStorage.setItem('todo_list', JSON.stringify(todoList));

        // apply to DOM
        const newLiElement = createTodoElement(newTodo);
        const ulElement = document.querySelector('ul#todoList');
        if (!ulElement) return;
        ulElement.appendChild(newLiElement);
    }

    // reset form - remove text on form
    delete todoForm.dataset.id; //for edit mode
    todoForm.reset();
}

// main
(() => {
    //add this in application tab on devtools
    // const todoList = [
    //     { id: 1, title: 'Học HTML/CSS', status: 'pending' },
    //     { id: 2, title: 'Học JS', status: 'completed' },
    //     { id: 3, title: 'Học React', status: 'pending' },
    //     { id: 4, title: 'Học PHP', status: 'completed' },
    // ];

    // localStorage.setItem('todo_list', JSON.stringify(todoList));

    const todoList = getTodoList();
    renderTodoList('todoList', todoList);

    // register submit event for todo form
    const todoForm = document.getElementById('todoFormId');
    if (todoForm) {
        todoForm.addEventListener('submit', handleTodoFormSubmit);
    }
})();

// =========================================DRAFT CODING========================================================

// // -----------------v8-update todo------------------------
// // todo = { id: 1, title: 'Học HTML/CSS', status: 'pending' } -> <li data-id="1" data-status="pending"> Template </li>
// function createTodoElement(todo) {
//     if (!todo) return null;

//     // find template
//     const todoTemplate = document.querySelector('#todoTemplate');
//     if (!todoTemplate) {
//         alert("Can't find the Todo Template");
//         return;
//     }

//     //1. clone li template
//     // const todoElement = todoTemplate.content.querySelector('li').cloneNode(true);
//     const todoElement = todoTemplate.content.firstElementChild.cloneNode(true);
//     todoElement.dataset.id = todo.id;
//     todoElement.dataset.status = todo.status;

//     // 2. render current todo status
//     const divAlertElement = todoElement.querySelector('div.todo');
//     if (!divAlertElement) return null;

//     const alertClass = todo.status === 'pending' ? 'alert-secondary' : 'alert-success';
//     divAlertElement.classList.remove('alert-secondary'); //default status Alert of div is alert-secondary
//     divAlertElement.classList.add(alertClass);

//     // 2.1. render current 'mark-as-done' button
//     const markAsDoneButton = todoElement.querySelector('button.mark-as-done');
//     if (markAsDoneButton) {
//         markAsDoneButton.textContent = todo.status === 'pending' ? 'Finish' : 'Reset';

//         const buttonAlertElement = todo.status === 'pending' ? 'btn-dark' : 'btn-success';
//         markAsDoneButton.classList.remove('btn-success'); //default
//         markAsDoneButton.classList.add(buttonAlertElement);
//     }

//     // 3. update p tittle
//     const titleElement = todoElement.querySelector('.todo__title');
//     if (titleElement) titleElement.textContent = todo.title;

//     //TODO: attach event to buttons

//     // add click event for mark-as-done button
//     // const markAsDoneButton = todoElement.querySelector('button.mark-as-done');
//     if (markAsDoneButton) {
//         markAsDoneButton.addEventListener('click', function () {
//             // new status
//             const currentStatus = todoElement.dataset.status;
//             const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

//             // get current todoList in localStorage
//             // update status of current todo
//             // save to local storage, làm trước khi update vào ui
//             const todoList = getTodoList();
//             const index = todoList.findIndex((x) => x.id === todo.id); //tìm ông update ở index bao nhiêu
//             if (index >= 0) {
//                 todoList[index].status = newStatus; //update lại
//                 localStorage.setItem('todo_list', JSON.stringify(todoList)); //lưu lại
//             }

//             //update status from dom tree
//             todoElement.dataset.status = newStatus;

//             //update new alert
//             const newDivAlert = currentStatus === 'pending' ? 'alert-success' : 'alert-secondary';
//             divAlertElement.classList.remove('alert-secondary', 'alert-success');
//             divAlertElement.classList.add(newDivAlert);

//             //update content status of button
//             markAsDoneButton.textContent = currentStatus === 'pending' ? 'Reset' : 'Finish';

//             const newButtonAlert = currentStatus === 'pending' ? 'btn-success' : 'btn-dark';
//             markAsDoneButton.classList.remove('btn-success', 'btn-dark');
//             markAsDoneButton.classList.add(newButtonAlert);
//         });
//     }

//     // add click event for remove button (Remove)
//     const removeButton = todoElement.querySelector('button.remove');
//     if (removeButton) {
//         removeButton.addEventListener('click', () => {
//             //get current todo list in local storage (get API)
//             // where is the remove todo id
//             //remove id want to remove

//             // save from local storage
//             const todoList = getTodoList();
//             // console.log({todoList, removeId: todo.id });
//             const newTodoList = todoList.filter((x) => x.id !== todo.id);
//             localStorage.setItem('todo_list', JSON.stringify(newTodoList));

//             // remove from dom tree
//             todoElement.remove();
//         });
//     }

//     //add click event for edit button
//     const editButton = todoElement.querySelector('button.edit');
//     if (editButton) {
//         editButton.addEventListener('click', () => {
//             // TODO: latest todo data - get form local storage
//             // need to get todo from local storage
//             const todoList = getTodoList();
//             const latestTodo = todoList.find((x) => x.id === todo.id);
//             if (!latestTodo) return;

//             //populate data to todo form
//             populateTodoForm(latestTodo);
//         });
//     }

//     return todoElement;
// }

// function populateTodoForm(todo) {
//     // query todo form
//     // dataset.id =todo.id (set todo id lên todo form để phân biệt add new or edit)
//     const todoForm = document.getElementById('todoFormId');
//     if (!todoForm) return;
//     todoForm.dataset.id = todo.id;

//     // set values for form controls
//     // set todoText input (nhiều form thì set nhiều thằng -> lặp lại -> viết loop)
//     const todoInput = document.getElementById('todoText');
//     if (todoInput) {
//         todoInput.value = todo.title;
//     }
// }

// function getTodoList() {
//     //JSON khi lấy ko đc có thể lỗi
//     try {
//         return JSON.parse(localStorage.getItem('todo_list')) || [];
//     } catch {
//         return [];
//     }
// }

// function renderTodoList(ulElementById, todoList) {
//     // check todoList
//     if (!Array.isArray || todoList.length === 0) return;

//     // find/check ul element in Dom
//     const ulElement = document.querySelector('#todoList');
//     if (!ulElement) return;

//     // loop though todoList
//     for (const todo of todoList) {
//         // 1,2 -> function createTodoElement(todo)

//         const liElement = createTodoElement(todo);
//         // 3.Add li to Dom tree (add ul to li)
//         ulElement.appendChild(liElement);
//     }
// }

// function handleTodoFormSubmit(event) {
//     event.preventDefault(); //chặn bấm submit reload lại trang

//     const todoForm = document.getElementById('todoFormId');
//     if (!todoForm) return;

//     // get form values (query directly to id input or query form>input.name tag)
//     //nếu có nhiều form thì tách ra hàm riêng để trả về một loạt giá trị từ các form
//     const todoInput = document.getElementById('todoText');
//     if (!todoInput) return;

//     //validate form values (data input by users is correct)

//     // determine add new or edit mode

//     const isEdit = Boolean(todoForm.dataset.id);

//     if (isEdit) {
//         //// edit mode
//         //find current todo
//         const todoList = getTodoList();
//         const index = todoList.findIndex((x) => x.id.toString() === todoForm.dataset.id); //dataset kieu du lieu la string
//         if (index < 0) return;

//         //update content
//         todoList[index].title = todoInput.value;

//         //save
//         localStorage.setItem('todo_list', JSON.stringify(todoList));

//         //apply DOM changes
//         //find li element having id = todoForm.dataset.id
//         const liElement = document.querySelector(
//             `ul#todoList > li[data-id = "${todoForm.dataset.id}"]`,
//         );
//         if (liElement) {
//             // liElement.textContent = todoInput.value;
//             const titleElement = liElement.querySelector('.todo__title');
//             if (titleElement) titleElement.textContent = todoInput.value;
//         }
//     } else {
//         //// add mode
//         const newTodo = { id: Date.now(), title: todoInput.value, status: 'pending' };

//         // save to Local Storage
//         const todoList = getTodoList();
//         todoList.push(newTodo);
//         localStorage.setItem('todo_list', JSON.stringify(todoList));

//         // apply to DOM
//         const newLiElement = createTodoElement(newTodo);
//         const ulElement = document.querySelector('ul#todoList');
//         if (!ulElement) return;
//         ulElement.appendChild(newLiElement);
//     }

//     // reset form - remove text on form
//     delete todoForm.dataset.id; //for edit mode
//     todoForm.reset();
// }

// // main
// (() => {
//     //add this in application tab on devtools
//     // const todoList = [
//     //     { id: 1, title: 'Học HTML/CSS', status: 'pending' },
//     //     { id: 2, title: 'Học JS', status: 'completed' },
//     //     { id: 3, title: 'Học React', status: 'pending' },
//     //     { id: 4, title: 'Học PHP', status: 'completed' },
//     // ];

//     // localStorage.setItem('todo_list', JSON.stringify(todoList));

//     const todoList = getTodoList();
//     renderTodoList('todoList', todoList);

//     // register submit event for todo form
//     const todoForm = document.getElementById('todoFormId');
//     if (todoForm) {
//         todoForm.addEventListener('submit', handleTodoFormSubmit);
//     }
// })();

// // -----------------v7-create todo------------------------
// // todo = { id: 1, title: 'Học HTML/CSS', status: 'pending' } -> <li data-id="1" data-status="pending"> Template </li>
// function createTodoElement(todo) {
//     if (!todo) return null;

//     // find template
//     const todoTemplate = document.querySelector('#todoTemplate');
//     if (!todoTemplate) {
//         alert("Can't find the Todo Template");
//         return;
//     }

//     //1. clone li template
//     // const todoElement = todoTemplate.content.querySelector('li').cloneNode(true);
//     const todoElement = todoTemplate.content.firstElementChild.cloneNode(true);
//     todoElement.dataset.id = todo.id;
//     todoElement.dataset.status = todo.status;

//     // 2. render current todo status
//     const divAlertElement = todoElement.querySelector('div.todo');
//     if (!divAlertElement) return null;

//     const alertClass = todo.status === 'pending' ? 'alert-secondary' : 'alert-success';
//     divAlertElement.classList.remove('alert-secondary'); //default status Alert of div is alert-secondary
//     divAlertElement.classList.add(alertClass);

//     // 2.1. render current mark-as-done button
//     const markAsDoneButton = todoElement.querySelector('button.mark-as-done');
//     if (markAsDoneButton) {
//         markAsDoneButton.textContent = todo.status === 'pending' ? 'Finish' : 'Reset';

//         const buttonAlertElement = todo.status === 'pending' ? 'btn-dark' : 'btn-success';
//         markAsDoneButton.classList.remove('btn-success'); //default
//         markAsDoneButton.classList.add(buttonAlertElement);
//     }

//     // 3. update p tittle
//     const titleElement = todoElement.querySelector('.todo__title');
//     titleElement.textContent = todo.title;

//     //TODO: attach event to buttons
//     // add click event for mark-as-done button
//     // const markAsDoneButton = todoElement.querySelector('button.mark-as-done');
//     if (markAsDoneButton) {
//         markAsDoneButton.addEventListener('click', function () {
//             // new status
//             const currentStatus = todoElement.dataset.status;
//             const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

//             // get current todoList in localStorage
//             // update status of current todo
//             // save to local storage, làm trước khi update vào ui
//             const todoList = getTodoList();
//             const index = todoList.findIndex((x) => x.id === todo.id); //tìm ông update ở index bao nhiêu
//             if (index >= 0) {
//                 todoList[index].status = newStatus; //update lại
//                 localStorage.setItem('todo_list', JSON.stringify(todoList)); //lưu lại
//             }

//             //update status from dom tree
//             todoElement.dataset.status = newStatus;

//             //update new alert
//             const newDivAlert = currentStatus === 'pending' ? 'alert-success' : 'alert-secondary';
//             divAlertElement.classList.remove('alert-secondary', 'alert-success');
//             divAlertElement.classList.add(newDivAlert);

//             //update content status of button
//             markAsDoneButton.textContent = currentStatus === 'pending' ? 'Reset' : 'Finish';

//             const newButtonAlert = currentStatus === 'pending' ? 'btn-success' : 'btn-dark';
//             markAsDoneButton.classList.remove('btn-success', 'btn-dark');
//             markAsDoneButton.classList.add(newButtonAlert);
//         });
//     }

//     // add click event for remove button (Remove)
//     const removeButton = todoElement.querySelector('button.remove');
//     if (removeButton) {
//         removeButton.addEventListener('click', () => {
//             //get current todo list in local storage (get API)
//             // where is the remove todo id
//             //remove id want to remove

//             // save from local storage
//             const todoList = getTodoList();
//             // console.log({todoList, removeId: todo.id });
//             const newTodoList = todoList.filter((x) => x.id !== todo.id);
//             localStorage.setItem('todo_list', JSON.stringify(newTodoList));

//             // remove from dom tree
//             todoElement.remove();
//         });
//     }

//     return todoElement;
// }

// function getTodoList() {
//     //JSON khi lấy ko đc có thể lỗi
//     try {
//         return JSON.parse(localStorage.getItem('todo_list')) || [];
//     } catch {
//         return [];
//     }
// }

// function renderTodoList(ulElementById, todoList) {
//     // check todoList
//     if (!Array.isArray || todoList.length === 0) return;

//     // find/check ul element in Dom
//     const ulElement = document.querySelector('#todoList');
//     if (!ulElement) return;

//     // loop though todoList
//     for (const todo of todoList) {
//         // 1,2 -> function createTodoElement(todo)

//         const liElement = createTodoElement(todo);
//         // 3.Add li to Dom tree (add ul to li)
//         ulElement.appendChild(liElement);
//     }
// }

// function handleTodoFormSubmit(event) {
//     event.preventDefault();
//     console.log('form submit');

//     // get form values (query directly to id input or query form>input.name tag)
//     //validate form values (data input by users is correct)
//     const todoInput = document.getElementById('todoText');
//     if (!todoInput) {
//         alert('Todo Input Not Found');
//         return;
//     }

//     const newTodo = { id: Date.now(), title: todoInput.value, status: 'pending' };

//     // save to Local Storage
//     const todoList = getTodoList();
//     todoList.push(newTodo);
//     localStorage.setItem('todo_list', JSON.stringify(todoList));

//     // apply to DOM
//     const newLiElement = createTodoElement(newTodo);
//     const ulElement = document.querySelector('ul#todoList');
//     if (!ulElement) return;
//     ulElement.appendChild(newLiElement);

//     // reset form - remove text on form
//     const todoForm = document.getElementById('todoFormId');
//     if (todoForm) todoForm.reset();
// }

// // main
// (() => {
//     //add this in application tab on devtools
//     // const todoList = [
//     //     { id: 1, title: 'Học HTML/CSS', status: 'pending' },
//     //     { id: 2, title: 'Học JS', status: 'completed' },
//     //     { id: 3, title: 'Học React', status: 'pending' },
//     //     { id: 4, title: 'Học PHP', status: 'completed' },
//     // ];

//     // localStorage.setItem('todo_list', JSON.stringify(todoList));

//     const todoList = getTodoList();
//     renderTodoList('todoList', todoList);

//     // register submit event for todo form
//     const todoForm = document.getElementById('todoFormId');
//     if (todoForm) {
//         todoForm.addEventListener('submit', handleTodoFormSubmit);
//     }
// })();

// // -----------------v6-load dato from local storage------------------------
// // todo = { id: 1, title: 'Học HTML/CSS', status: 'pending' } -> <li data-id="1" data-status="pending"> Template </li>
// function createTodoElement(todo) {
//     if (!todo) return null;

//     // find template
//     const todoTemplate = document.querySelector('#todoTemplate');
//     if (!todoTemplate) return alert("Can't find the Todo Template");

//     //1. clone li template
//     // const todoElement = todoTemplate.content.querySelector('li').cloneNode(true);
//     const todoElement = todoTemplate.content.firstElementChild.cloneNode(true);
//     todoElement.dataset.id = todo.id;
//     todoElement.dataset.status = todo.status;

//     // 2. render current todo status
//     const divAlertElement = todoElement.querySelector('div.todo');
//     if (!divAlertElement) return null;

//     const alertClass = todo.status === 'pending' ? 'alert-secondary' : 'alert-success';
//     divAlertElement.classList.remove('alert-secondary'); //default status Alert of div is alert-secondary
//     divAlertElement.classList.add(alertClass);

//     // 2.1. render current mark-as-done button
//     const markAsDoneButton = todoElement.querySelector('button.mark-as-done');
//     if (markAsDoneButton) {
//         markAsDoneButton.textContent = todo.status === 'pending' ? 'Finish' : 'Reset';

//         const buttonAlertElement = todo.status === 'pending' ? 'btn-dark' : 'btn-success';
//         markAsDoneButton.classList.remove('btn-success'); //default
//         markAsDoneButton.classList.add(buttonAlertElement);
//     }

//     // 3. update p tittle
//     const titleElement = todoElement.querySelector('.todo__title');
//     titleElement.textContent = todo.title;

//     //TODO: attach event to buttons
//     // add click event for mark-as-done button
//     // const markAsDoneButton = todoElement.querySelector('button.mark-as-done');
//     if (markAsDoneButton) {
//         markAsDoneButton.addEventListener('click', function () {
//             // new status
//             const currentStatus = todoElement.dataset.status;
//             const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

//             // get current todoList in localStorage
//             // update status of current todo
//             // save to local storage, làm trước khi update vào ui
//             const todoList = getTodoList();
//             const index = todoList.findIndex((x) => x.id === todo.id); //tìm ông update ở index bao nhiêu
//             if (index >= 0) {
//                 todoList[index].status = newStatus; //update lại
//                 localStorage.setItem('todo_list', JSON.stringify(todoList)); //lưu lại
//             }

//             //update status from dom tree
//             todoElement.dataset.status = newStatus;

//             //update new alert
//             const newDivAlert = currentStatus === 'pending' ? 'alert-success' : 'alert-secondary';
//             divAlertElement.classList.remove('alert-secondary', 'alert-success');
//             divAlertElement.classList.add(newDivAlert);

//             //update content status of button
//             markAsDoneButton.textContent = currentStatus === 'pending' ? 'Reset' : 'Finish';

//             const newButtonAlert = currentStatus === 'pending' ? 'btn-success' : 'btn-dark';
//             markAsDoneButton.classList.remove('btn-success', 'btn-dark');
//             markAsDoneButton.classList.add(newButtonAlert);
//         });
//     }

//     // add click event for remove button (Remove)
//     const removeButton = todoElement.querySelector('button.remove');
//     if (removeButton) {
//         removeButton.addEventListener('click', () => {
//             //get current todo list in local storage (get API)
//             // where is the remove todo id
//             //remove id want to remove

//             // save from local storage
//             const todoList = getTodoList();
//             // console.log({todoList, removeId: todo.id });
//             const newTodoList = todoList.filter((x) => x.id !== todo.id);
//             localStorage.setItem('todo_list', JSON.stringify(newTodoList));

//             // remove from dom tree
//             todoElement.remove();
//         });
//     }

//     return todoElement;
// }

// function getTodoList() {
//     //JSON khi lấy ko đc có thể lỗi
//     try {
//         return JSON.parse(localStorage.getItem('todo_list')) || [];
//     } catch {
//         return [];
//     }
// }

// function renderTodoList(ulElementById, todoList) {
//     // check todoList
//     if (!Array.isArray || todoList.length === 0) return;

//     // find/check ul element in Dom
//     const ulElement = document.querySelector('#todoList');
//     if (!ulElement) return;

//     // loop though todoList
//     for (const todo of todoList) {
//         // 1,2 -> function createTodoElement(todo)

//         const liElement = createTodoElement(todo);
//         // 3.Add li to Dom tree (add ul to li)
//         ulElement.appendChild(liElement);
//     }
// }

// // main
// (() => {
//     //add this in application tab on devtools
//     // const todoList = [
//     //     { id: 1, title: 'Học HTML/CSS', status: 'pending' },
//     //     { id: 2, title: 'Học JS', status: 'completed' },
//     //     { id: 3, title: 'Học React', status: 'pending' },
//     //     { id: 4, title: 'Học PHP', status: 'completed' },
//     // ];

//     // localStorage.setItem('todo_list', JSON.stringify(todoList));

//     const todoList = getTodoList();

//     renderTodoList('todoList', todoList);
// })();
// // -----------------v5-add event for buttons------------------------
// // todo = { id: 1, title: 'Học HTML/CSS', status: 'pending' } -> <li data-id="1" data-status="pending"> Template </li>
// function createTodoElement(todo) {
//     if (!todo) return null;

//     // find template
//     const todoTemplate = document.querySelector('#todoTemplate');
//     if (!todoTemplate) return alert("Can't find the Todo Template");

//     //1. clone li template
//     // const todoElement = todoTemplate.content.querySelector('li').cloneNode(true);
//     const todoElement = todoTemplate.content.firstElementChild.cloneNode(true);
//     todoElement.dataset.id = todo.id;
//     todoElement.dataset.status = todo.status;

//     // 2. render current todo status
//     const divAlertElement = todoElement.querySelector('div.todo');
//     if (!divAlertElement) return null;

//     const alertClass = todo.status === 'pending' ? 'alert-secondary' : 'alert-success';
//     divAlertElement.classList.remove('alert-secondary'); //default status Alert of div is alert-secondary
//     divAlertElement.classList.add(alertClass);

//     // 2.1. render current mark-as-done button
//     const markAsDoneButton = todoElement.querySelector('button.mark-as-done');
//     if (markAsDoneButton) {
//         markAsDoneButton.textContent = todo.status === 'pending' ? 'Finish' : 'Reset';

//         const buttonAlertElement = todo.status === 'pending' ? 'btn-dark' : 'btn-success';
//         markAsDoneButton.classList.remove('btn-success'); //default
//         markAsDoneButton.classList.add(buttonAlertElement);
//     }

//     // 3. update p tittle
//     const titleElement = todoElement.querySelector('.todo__title');
//     titleElement.textContent = todo.title;

//     //TODO: attach event to buttons
//     // add click event for mark-as-done button
//     // const markAsDoneButton = todoElement.querySelector('button.mark-as-done'); created above
//     if (markAsDoneButton) {
//         markAsDoneButton.addEventListener('click', function () {
//             console.log('mark as done click');

//             const currentStatus = todoElement.dataset.status;

//             // new status
//             todoElement.dataset.status = currentStatus === 'pending' ? 'completed' : 'pending';

//             //new alert
//             const newDivAlert = currentStatus === 'pending' ? 'alert-success' : 'alert-secondary';
//             divAlertElement.classList.remove('alert-secondary', 'alert-success');
//             divAlertElement.classList.add(newDivAlert);

//             //update content status of button
//             markAsDoneButton.textContent = currentStatus === 'pending' ? 'Reset' : 'Finish';

//             const newButtonAlert = currentStatus === 'pending' ? 'btn-success' : 'btn-dark';
//             markAsDoneButton.classList.remove('btn-success', 'btn-dark');
//             markAsDoneButton.classList.add(newButtonAlert);
//         });
//     }

//     // add click event for remove button (Remove)
//     const removeButton = todoElement.querySelector('button.remove');
//     if (removeButton) {
//         removeButton.addEventListener('click', () => {
//             console.log('remove Button');
//             todoElement.remove();
//         });
//     }

//     return todoElement;
// }

// function renderTodoList(ulElementById, todoList) {
//     // check todoList
//     if (!Array.isArray || todoList.length === 0) return;

//     // find/check ul element in Dom
//     const ulElement = document.querySelector('#todoList');
//     if (!ulElement) return;

//     // loop though todoList
//     for (const todo of todoList) {
//         // 1,2 -> function createTodoElement(todo)

//         const liElement = createTodoElement(todo);
//         // 3.Add li to Dom tree (add ul to li)
//         ulElement.appendChild(liElement);
//     }
// }

// // main
// (() => {
//     // input array todoList
//     const todoList = [
//         { id: 1, title: 'Học HTML/CSS', status: 'pending' },
//         { id: 2, title: 'Học JS', status: 'completed' },
//         { id: 3, title: 'Học React', status: 'pending' },
//         { id: 4, title: 'Học PHP', status: 'completed' },
//     ];

//     renderTodoList('todoList', todoList);

//     // do something else
// })();

// // -----------------v4-------------------------

// function renderTodoList(ulElementById, todoList) {
//     // check todoList
//     if (!Array.isArray || todoList.length === 0) return;

//     // find/check ul element
//     const ulElement = document.querySelector('.todoList');
//     if (!ulElement) return;

//     // loop though todoList
//     for (const todo of todoList) {
//         // 1,2 -> function createTodoElement(todo)

//         const liElement = createTodoElement(todo);
//         // 3.Add li to Dom tree (add ul to li)
//         ulElement.appendChild(liElement);
//     }
// }

// function createTodoElement(todo) {
//     if (!todo) return null;

//     // find template
//     const todoTemplate = document.querySelector('#todoTemplate');
//     if (!todoTemplate) return alert("Can't find the Todo Template");

//     //1. clone li template
//     // const todoElement = todoTemplate.content.querySelector('li').cloneNode(true);
//     const todoElement = todoTemplate.content.firstElementChild.cloneNode(true);
//     todoElement.dataset.id = todo.id;

//     // 2. update li tittle
//     const titleElement = todoElement.querySelector('.todo__title');
//     titleElement.textContent = todo.title;

//     //TODO: attach event to buttons

//     return todoElement;
// }

// // main

// (() => {
//     // input array todoList
//     const todoList = [
//         { id: 1, title: 'Học HTML/CSS' },
//         { id: 2, title: 'Học JS' },
//         { id: 3, title: 'Học React' },
//         { id: 4, title: 'Học PHP' },
//     ];

//     renderTodoList('todoList', todoList);

//     // do something else
// })();

// // ------dynamic todoList-----------v3-------------------------
// function renderTodoList(ulElementById, todoList) {
//     // each todo in array -> create li element -> append to ul

//     // find/check ul element
//     const ulElement = document.querySelector('.todoList');
//     if (!ulElement) return;

//     // loop though todoList
//     for (const todo of todoList) {
//         // 1,2 -> function createTodoElement(todo)

//         const liElement = createTodoElement(todo);
//         // 3.Add li to Dom tree (add ul to li)
//         ulElement.appendChild(liElement);
//     }
// }

// function createTodoElement(todo) {
//     if (!todo) return null;
//     // 1.Create li element
//     const liElement = document.createElement('li');

//     // 2.Set attr tittle for new li element
//     liElement.textContent = todo.title;

//     // 2.1.Set attr id for new li element
//     // liElement.setAttribute('id', todo.id);
//     liElement.dataset.id = todo.id;

//     return liElement;
// }

// (() => {
//     // input array todoList
//     const todoList = [
//         { id: 1, title: 'Học HTML/CSS' },
//         { id: 2, title: 'Học JS' },
//         { id: 3, title: 'Học React' },
//         { id: 4, title: 'Học PHP' },
//     ];

//     renderTodoList('todoList', todoList);

//     const todoList1 = [
//         { id: 1, title: 'Làm Frontend' },
//         { id: 2, title: 'Làm backend' },
//         { id: 3, title: 'Làm Fullstack' },
//         { id: 4, title: 'Làm app' },
//     ];

//     renderTodoList('todoList1', todoList1);

//     // do something else
// })();

// //input a Array -> render a todoList
// // -----------------v2-------------------------
// function renderTodoList(ulElementById) {
//     // each todo in array -> create li element -> append to ul

//     // find/check ul element
//     const ulElement = document.querySelector('.todoList');
//     if (!ulElement) return;

//     // input array todoList
//     const todoList = [
//         { id: 1, title: 'Học HTML/CSS' },
//         { id: 2, title: 'Học JS' },
//         { id: 3, title: 'Học React' },
//         { id: 4, title: 'Học PHP' },
//     ];

//     // loop though todoList
//     for (const todo of todoList) {
//         // 1,2 -> function createTodoElement(todo)

//         const liElement = createTodoElement(todo);
//         // 3.Add li to Dom tree (add ul to li)
//         ulElement.appendChild(liElement);
//     }
// }

// function createTodoElement(todo) {
// if (!todo) return null;
//     // 1.Create li element
//     const liElement = document.createElement('li');

//     // 2.Set attr tittle for new li element
//     liElement.textContent = todo.title;

//     // 2.1.Set attr id for new li element
//     // liElement.setAttribute('id', todo.id);
//     liElement.dataset.id = todo.id;

//     return liElement;
// }

// (() => {
//     renderTodoList('todoList');

//     // do something else
// })();

// // -----------------v1-------------------------
// function renderTodoList(ulElementById) {
//     // each todo in array -> create li element -> append to ul

//     // find/check ul element
//     const ulElement = document.querySelector('.todoList');
//     if (!ulElement) return;

//     // input array todoList
//     const todoList = [
//         { id: 1, title: 'Học HTML/CSS' },
//         { id: 2, title: 'Học JS' },
//         { id: 3, title: 'Học React' },
//         { id: 4, title: 'Học PHP' },
//     ];

//     // loop though todoList
//     for (const todo of todoList) {
//         // 1.Create li element
//         const liElement = document.createElement('li');

//         // 2.Set attr tittle for new li element
//         liElement.textContent = todo.title;

//         // 2.1.Set attr id for new li element
//         // liElement.setAttribute('id', todo.id);
//         liElement.dataset.id = todo.id;

//         // 3.Add li to Dom tree (add ul to li)
//         ulElement.appendChild(liElement);
//     }
// }

// (() => {
//     renderTodoList();

//     // do something else
// })();
