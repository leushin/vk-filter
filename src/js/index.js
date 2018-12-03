import "../css/style.css";

VK.init({
    apiId: 6763997
});

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
    <li class="friend" data-id="{{id}}">
        <img class="photo" src="{{photo_50}}" alt="photo">
        <div class="name">{{first_name}} {{last_name}}</div>
        <div class="add"></div>
    </li>
    {{/each}}`;
    let render = Handlebars.compile(template);

    container.innerHTML = render(items);
}

auth().then(async () => {
    const listFriendsAll = document.querySelector('.friends .all .list');
    const listFriendsFav = document.querySelector('.friends .fav .list');

    const friends = await vkAPI('friends.get', { fields: 'photo_50' });
    
    console.log(friends);

    renderList(friends, listFriendsAll);
});