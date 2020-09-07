'use strict'

const control = (function() {
    let projects = [];
    if(!localStorage.getItem('toDoProjects')) {
        localStorage.setItem('toDoProjects', JSON.stringify(projects));
      }
    projects = JSON.parse(localStorage.getItem('toDoProjects'));

    class ToDo {
        constructor(title, date, desc, priority) {
            this.title = title;
            this.date = date;
            this.desc = desc;
            this.priority = priority;
            this.complete = false;
        }
    };
    
    class Project {
        constructor(title) {
            this.title = title;
            this.toDos = [];
        }
    };

    function addProject(title) {
        projects.push(new Project(title));
        localStorage.setItem('toDoProjects', JSON.stringify(projects));
    }

    function changeProjectName(project, newName) {
        project.title = newName;
        localStorage.setItem('toDoProjects', JSON.stringify(projects));
    }

    function addToDo(index, title, date, desc, priority) {
        projects[index].toDos.push(new ToDo(title, date, desc, priority));
        localStorage.setItem('toDoProjects', JSON.stringify(projects));
    }

    function edit(toDo, key, newInfo) {
        toDo[key] = newInfo;
        localStorage.setItem('toDoProjects', JSON.stringify(projects));
    }

    function removeProject(index) {
        projects.splice(index, 1);
        localStorage.setItem('toDoProjects', JSON.stringify(projects));
    }

    function removeToDo(projectIndex, toDoIndex) {
        projects[projectIndex].toDos.splice(toDoIndex, 1);
        localStorage.setItem('toDoProjects', JSON.stringify(projects));
    }
    return {
        projects,
        addProject,
        changeProjectName,
        addToDo,
        edit,
        removeProject,
        removeToDo
    };
})();

const view = (function() {
    function renderProject(project) {
        const li = document.createElement('li');

        const bullet = document.createElement('i');
        bullet.classList.toggle('fas');
        bullet.classList.toggle('fa-circle');
        li.appendChild(bullet);

        const name = document.createElement('input');
        name.setAttribute('type', 'text');
        name.value = project.title;
        name.addEventListener('input', function() {
            control.changeProjectName(project, this.value);
        });
        li.appendChild(name);

        const remove = document.createElement('i');
        remove.classList.toggle('fas');
        remove.classList.toggle('fa-times');
        remove.addEventListener('click', function(e) {
            e.stopPropagation();
            control.removeProject(this.parentNode.getAttribute('data'));
            this.parentNode.parentNode.removeChild(this.parentNode);
            if (control.projects.length === 0) document.querySelector('#projects .add').dispatchEvent(new Event('click'));
            document.querySelector('#projects li').dispatchEvent(new Event('click'));
            for (let i = 0; i < control.projects.length; i++) {
                document.querySelector(`#projects li:nth-child(${i + 1})`).setAttribute('data', i);
            }
        });
        li.appendChild(remove);

        li.setAttribute('data', control.projects.indexOf(project));
        document.querySelector('#projects ul').appendChild(li);

        li.addEventListener('click', function() {
            document.querySelector('#todos ul').textContent = '';
            for (let todo of control.projects[this.getAttribute('data')].toDos) renderToDo(control.projects[this.getAttribute('data')], todo);
            if (document.querySelector('.selected')) {
                document.querySelector('.selected').classList.toggle('selected');
            }
            this.classList.toggle('selected');
    });
    }
    for (let project of control.projects) renderProject(project);

    function renderToDo(project, todo) {
        
        const li = document.createElement('li');
        li.setAttribute('data-number', project.toDos.indexOf(todo));
        li.setAttribute('data-project', control.projects.indexOf(project));

        const span = document.createElement('span');

        const bullet = document.createElement('i');
        bullet.classList.toggle('far');
            if (todo.complete) {
            bullet.classList.toggle('fa-check-circle');
        } else {
            bullet.classList.toggle('fa-circle');
        }
        bullet.addEventListener('click', function() {
            this.classList.toggle('fa-check-circle');
            this.classList.toggle('fa-circle');
            control.edit(control.projects[this.parentNode.parentNode.dataset.project].toDos[this.parentNode.parentNode.dataset.number], 'complete', !control.projects[this.parentNode.parentNode.dataset.project].toDos[this.parentNode.parentNode.dataset.number].complete);
        });
        if (todo.priority == 2) {
            bullet.style.color = 'maroon';
        } else if (todo.priority == 3) {
            bullet.style.color = 'orangered';
        }
        span.appendChild(bullet);

        const title = document.createElement('input');
        title.setAttribute('type', 'text');
        title.value = todo.title;
        title.addEventListener('input', function() {
            control.edit(control.projects[this.parentNode.parentNode.dataset.project].toDos[this.parentNode.parentNode.dataset.number], 'title', this.value);
        });
        span.appendChild(title);

        const arrow = document.createElement('i');
        arrow.classList.toggle('fas');
        arrow.classList.toggle('fa-angle-down');
        span.appendChild(arrow);

        li.appendChild(span);
        li.dataset.expanded = 'false';
        document.querySelector('#todos ul').appendChild(li);
        document.querySelectorAll('.fa-angle-down').forEach(arrow => arrow.addEventListener('click', expand));
    }
    
    document.querySelector('#projects li') && document.querySelector('#projects li').dispatchEvent(new Event('click'));

    function expand() {
        if (this.parentNode.parentNode.dataset.expanded != 'true') {
            const details = document.createElement('div');
            details.classList.toggle('details');

            const date = document.createElement('input');
            date.setAttribute('type', 'date');
            date.value = control.projects[this.parentNode.parentNode.dataset.project].toDos[this.parentNode.parentNode.dataset.number].date;
            date.addEventListener('input', function() {
                control.edit(control.projects[this.parentNode.parentNode.dataset.project].toDos[this.parentNode.parentNode.dataset.number], 'date', this.value);
            });
            details.appendChild(date);

            const priority = document.createElement('input');
            priority.setAttribute('type', 'range');
            priority.setAttribute('min', 1);
            priority.setAttribute('max', 3);
            priority.value = control.projects[this.parentNode.parentNode.dataset.project].toDos[this.parentNode.parentNode.dataset.number].priority;
            priority.addEventListener('input', function(){
                control.edit(control.projects[this.parentNode.parentNode.dataset.project].toDos[this.parentNode.parentNode.dataset.number], 'priority', this.value);
                if (control.projects[this.parentNode.parentNode.dataset.project].toDos[this.parentNode.parentNode.dataset.number].priority == 3) {
                    document.querySelector(`li[data-number="${this.parentNode.parentNode.dataset.number}"] i`).style.color = 'orangered';
                } else if (control.projects[this.parentNode.parentNode.dataset.project].toDos[this.parentNode.parentNode.dataset.number].priority == 2) {
                    document.querySelector(`li[data-number="${this.parentNode.parentNode.dataset.number}"] i`).style.color = 'maroon';
                } else if (control.projects[this.parentNode.parentNode.dataset.project].toDos[this.parentNode.parentNode.dataset.number].priority == 1) {
                    document.querySelector(`li[data-number="${this.parentNode.parentNode.dataset.number}"] i`).style.color = 'black';
                } 
            });
            details.appendChild(priority);

            const remove = document.createElement('i');
            remove.classList.toggle('fas');
            remove.classList.toggle('fa-trash-alt');
            remove.addEventListener('click', function() {
                control.removeToDo(this.parentNode.parentNode.dataset.project, this.parentNode.parentNode.dataset.number);
                this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
                for (let i = 0; i < control.projects[this.parentNode.parentNode.dataset.project].toDos.length; i++) {
                    document.querySelector(`#todos li:nth-child(${i + 1})`).dataset.number = i;
                }
            });
            details.appendChild(remove);

            const desc = document.createElement('textarea');
            function setHeight() {
                this.style.height = "";
                this.style.height = this.scrollHeight + "px";
                control.edit(control.projects[this.parentNode.parentNode.dataset.project].toDos[this.parentNode.parentNode.dataset.number], 'desc', this.value);
            }
            desc.oninput = setHeight;
            desc.textContent = control.projects[this.parentNode.parentNode.dataset.project].toDos[this.parentNode.parentNode.dataset.number].desc;
            details.appendChild(desc);

            this.parentNode.parentNode.appendChild(details);
            desc.dispatchEvent(new Event('input'));

            this.parentNode.parentNode.dataset.expanded = 'true';
        } else {
            this.parentNode.parentNode.removeChild(document.querySelector(`[data-number="${this.parentNode.parentNode.dataset.number}"] .details`));
            this.parentNode.parentNode.dataset.expanded = 'false';
        }
        
        this.classList.toggle('fa-angle-down');
        this.classList.toggle('fa-angle-up');
    }

    document.querySelector('#projects .add').addEventListener('click', function() {
        control.addProject('New project');
        renderProject(control.projects[control.projects.length - 1]);
    });
    
    document.querySelector('#todos .add').addEventListener('click', function() {
        control.addToDo(document.querySelector(`.selected`).getAttribute('data'), 'New task', '', '', 1);
        renderToDo(control.projects[document.querySelector(`.selected`).getAttribute('data')], control.projects[document.querySelector(`.selected`).getAttribute('data')].toDos[control.projects[document.querySelector(`.selected`).getAttribute('data')], control.projects[document.querySelector(`.selected`).getAttribute('data')].toDos.length - 1]);
    });
})();