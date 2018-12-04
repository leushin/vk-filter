import "../css/style.css";

VK.init({
    apiId: 6763997
});

const isMatching = (full, chunk) => new RegExp(chunk, 'i').test(full);

const auth = () => new Promise((resolve, reject) => {
    VK.Auth.login(data => {
        if (data.session) {
            resolve();
        } else {
            reject(new Error('Не удалось авторизоваться'));
        }
    }, 2);
});

const vkAPI = (method, params) => {
    params.v = '5.76';

    return new Promise((resolve, reject) => {
        VK.api(method, params, data => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        });
    });
}

const renderList = (items, container) => {
    let template = `
    {{#each items}}
    <div class="friend" data-id="{{id}}" draggable="true">
        <img class="photo" src="{{photo_50}}" alt="photo">
        <div class="name">{{first_name}} {{last_name}}</div>
        <img class="add" src="./img/plus.png" alt="plus">
    </div>
    {{/each}}`;
    let render = Handlebars.compile(template);

    container.innerHTML = render(items);
}

const makeDnD = (zones) => {
    let currentDrag;

    zones.forEach(zone => {
        zone.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/html', 'dragstart'); // for firefox
            currentDrag = { source: zone, node: e.target.closest('.friend') };
        });

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        zone.addEventListener('drop', (e) => {
            if (currentDrag) {
                e.preventDefault();

                if (currentDrag.source !== zone) {
                    zone.appendChild(currentDrag.node);
                }

                currentDrag = null;
            }
        }); 
    });
}

auth().then(async () => {
    try {
        const listFriendsAll = document.querySelector('.all .list');
        const listFriendsFav = document.querySelector('.fav .list');
        const search = document.querySelector('.search');
        const save = document.querySelector('.save');
        const friends = await vkAPI('friends.get', { fields: 'photo_50' });
    
        if (localStorage.all) {
            let allSaved = friends.items.filter(item => localStorage.all.includes(item.id));
            let favSaved = friends.items.filter(item => localStorage.fav.includes(item.id));
    
            renderList({count: allSaved.length, items: allSaved}, listFriendsAll);
            renderList({count: favSaved.length, items: favSaved}, listFriendsFav);
        } else {
            renderList(friends, listFriendsAll);
        }
        
        makeDnD([listFriendsAll, listFriendsFav]);
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add')) {
                if (e.target.closest('.all')) {
                    listFriendsFav.appendChild(e.target.parentNode);
                } else {
                    listFriendsAll.appendChild(e.target.parentNode);
                }
            }
        });
    
        search.addEventListener('keyup', (e) => {
            if (e.target.tagName === 'INPUT') {
                let source = document.querySelector(e.target.dataset.source);
                [...source.children].forEach(item => {
                    item.style.display = isMatching(item.querySelector('.name').innerText, e.target.value) ? 'block' : 'none';
                });
            }
        });
    
        save.addEventListener('click', () => {
            localStorage.all = JSON.stringify([...listFriendsAll.children].map(item => +item.dataset.id));
            localStorage.fav = JSON.stringify([...listFriendsFav.children].map(item => +item.dataset.id));
            alert('Списки друзей успешно сохранены!');
        });
    } catch(e) {
        console.error(e.message);
    }
});