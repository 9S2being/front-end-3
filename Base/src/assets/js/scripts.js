const characterContainer = document.getElementById('character-container');
const searchCharByName = document.getElementById('searchCharacter');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const numChar = document.getElementById('num-char');
const numLoc = document.getElementById('num-loc');
const numEp = document.getElementById('num-ep');
const title = document.getElementById('titulo');


let response;
let currentPage = 1;
let isLoading = false;
let currentCharacterList = [];
let charPerPage = 6;

///Função que tras a ultima localização 
async function getLocationInfo(locationUrl) {
    try {
        const response = await api.get(locationUrl);
        return response.data.name;
    } catch (error) {
        console.error('Erro ao buscar informações de localização', error);
        return 'Desconhecida';
    }
}

///Função que tras o ultimo episodio 
async function getLatestEpisode(episodeUrls) {
    try {
        if (episodeUrls.length === 0) {
            return 'Nenhum episódio conhecido';
        }

        const latestEpisodeUrl = episodeUrls[episodeUrls.length - 1];
        const parts = latestEpisodeUrl.split('/');
        const episodeNumber = parts[parts.length - 1];

        return `Episódio: ${episodeNumber}`;
    } catch (error) {
        console.error('Erro ao buscar informações de episódio', error);
        return 'Desconhecido';
    }
}

/// funçlão que mostra os personagens na tela
async function loadCharacter(page = 1, name = '') {
    try {
        isLoading = true;
        const params = {
            name: name,
            page: page,
            perPage: charPerPage
           
        };

        response = await api.get('/character', { params });

        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;

        currentCharacterList = response.data.results;

        characterContainer.innerHTML = '';

        currentCharacterList.forEach(async character => {
            const characterCard = document.createElement('div');
            characterCard.className = 'character-card';

            let statusClass = '';

            if (character.status === 'Alive') {
                statusClass = 'status-alive';
            } else if (character.status === 'Dead') {
                statusClass = 'status-dead';
            } else {
                statusClass = 'status-unknown';
            }


    characterCard.innerHTML = `
    <div class="col-6 d-flex mt-2">
    <div class="row border rounded-2" id="bg-card-out" style="overflow: hidden">
        <div class="col-6">
            <img src="${character.image}" class="card-img-left" alt="image-cards" style="width: 150px; height: 178px; margin-left: -11px;">
        </div>
        <div class="col-6">
            <div class="card-body" style="height: 178px; width: 250px;" id="bg-card-in">
                <h3 class="card-text fs-5 text-light" style="white-space: nowrap; margin-left: 15px">${character.name}</h3>
                <p class="card-text text-light" style=" font-size: 12px; margin-left: 30px">${character.status} - ${character.species}</p>
                <span class="card-text text-black" style="margin-left: 15px">Última localização: <br></span>
                <span class="card-text text-light" style="margin-left: 15px">${await getLocationInfo(character.location.url)}</span> <br>
                <span class="card-text text-black" style="margin-left: 15px">Visto pela última vez: <br></span>
                <span class="card-text text-light" style="margin-left: 15px">${await getLatestEpisode(character.episode)}</span>
            </div>
        </div>
    </div>
</div>`;

    characterContainer.appendChild(characterCard);
});


        prevPageBtn.disabled = !response.data.info.prev;
        nextPageBtn.disabled = currentPage === response.data.info.pages;
    } catch (error) {
        console.log('Personagem não encontrado', error);
    } finally {
        isLoading = false;
    }
}

/// Barra de pesquisa 
searchCharByName.addEventListener('input', () => {
    currentPage = 1;
    loadCharacter(currentPage, searchCharByName.value);
});

///Botões de ir e voltar
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1 && !isLoading) {
        currentPage--;
        loadCharacter(currentPage);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < response.data.info.pages && !isLoading) {
        currentPage++;
        loadCharacter(currentPage);
    }
});


///Mostar informação da quantidade de personagens, episodios e localizações

function showContagens() {
    const charactersUrl = 'https://rickandmortyapi.com/api/character';
    const locationsUrl = 'https://rickandmortyapi.com/api/location';
    const episodesUrl = 'https://rickandmortyapi.com/api/episode';

    fetch(charactersUrl)
        .then(response => response.json())
        .then(data => {
            numChar.innerHTML = `PERSONAGENS: ${data.info.count}`;
        })
        .catch(error => {
            console.error('Ocorreu um erro ao carregar o número de personagens:', error);
        });

    fetch(locationsUrl)
        .then(response => response.json())
        .then(data => {
            numLoc.innerHTML = `LOCALIZAÇÕES: ${data.info.count}`;
        })
        .catch(error => {
            console.error('Ocorreu um erro ao carregar o número de localizações:', error);
        });

    fetch(episodesUrl)
        .then(response => response.json())
        .then(data => {
            numEp.innerHTML = `EPISÓDIOS: ${data.info.count}`;
        })
        .catch(error => {
            console.error('Ocorreu um erro ao carregar o número de episódios:', error);
        });
}


showContagens(currentPage)
