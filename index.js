const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector ('#paginator')
let filteredMovies = []
const showModeButton = document.querySelector("#show-mode-button");
//default值為第一頁，先宣告變數後續可以在函式中使用
let currentPage = 1

//取得電影資料
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieListCard(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

//渲染card電影頁面函式
  function renderMovieListCard(data) {
    let rawHTML = ''
    data.forEach ((item) => {
      //title, image
      rawHTML += `      <div class="col-sm-3 card">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id ="${item.id}">
                More
              </button>

              <button class="btn btn-info btn-add-favorite" data-id ="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
    })
 
      dataPanel.innerHTML = rawHTML
  }

  //渲染list電影頁面函式
  function renderMovieListList(data) {
    let rawHTML = "";
    data.forEach((item) => {
      //title, image
      rawHTML += `       
        <div class ="list">
        <!-- title, more , + button -->
        <h5 class="list-title">${item.title}</h5>
       <div>
       <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id ="${item.id}">More</button>
        
        <button class="btn btn-info btn-add-favorite" data-id ="${item.id}">+</button>
        </div>
      </div>`;
    });

    dataPanel.innerHTML = rawHTML;
  }

  //監聽dataPanel: 監聽more及+ button
  dataPanel.addEventListener('click', function onPanelClicked (event){
    if (event.target.matches('.btn-show-movie')) {
      showMovieModal (event.target.dataset.id)
    }

    if (event.target.matches('.btn-add-favorite')) {
      addToFavorite (Number(event.target.dataset.id))
    }
  })

  //呈現modal(詳細電影內容)函式
  function showMovieModal (id) {
    const modalTitle = document.querySelector('#movie-modal-title')
    const modalImage = document.querySelector('#movie-modal-image')
    const modalDate = document.querySelector('#movie-modal-date')
    const modalDescription = document.querySelector('#movie-modal-description')

    axios.get (`${INDEX_URL}/${id}`) .then ((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release Date' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poste" class="img-fluid">`
    })
  }

//加入收藏功能函式
 function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if(list.some((movie) => movie.id === id)) {
    return alert ('此電影已經在收藏清單中!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


//搜尋功能
  searchForm.addEventListener('submit' , function onSearchFormSubmitted (event) {
    event.preventDefault();
    const keyword = searchInput.value.trim().toLowerCase();

    filteredMovies = movies.filter((movie) =>
      movie.title.toLowerCase().includes(keyword)
    );

    if (filteredMovies.length === 0) {
      return alert(`您輸入的關鍵字${keyword}沒有符合條件的電影`);
    }

    //重製分頁器
    renderPaginator(filteredMovies.length);
    //預設顯示第1頁的搜尋結果 
    //先找出當前頁面樣式是什麼，就知道下一頁要顯示甚麼樣的樣式
    if (dataPanel.children[0].matches(".card")) {
      renderMovieListCard(getMoviesByPage(1));
      currentPage = 1 //讓currentPage變為重新渲染的第一頁

    } else if (dataPanel.children[0].matches(".list")) {
      renderMovieListList(getMoviesByPage(1));
      currentPage = 1;
    }

  })


    function getMoviesByPage(page) {
    //計算起始Index
    const data = filteredMovies.length ? filteredMovies : movies
    const starIndex = (page - 1) * MOVIES_PER_PAGE
    //回傳切割後的新陣列
    return data.slice(starIndex, starIndex + MOVIES_PER_PAGE)
  }

  //製作分頁器函式
    function renderPaginator (amount) {
      //計算總頁數
      const numberOfPages = Math.ceil (amount / MOVIES_PER_PAGE)
      
      //製作template
      let rawHTML = ''

      for (let page = 1 ; page <= numberOfPages; page ++) {
        rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`
      }

      paginator.innerHTML = rawHTML
    }

  //監聽頁數並渲染畫面
    paginator.addEventListener('click', function onPaginatorClicked(event){
      //如果被點擊的不是a標籤，結束
      if (event.target.tagName !== 'A') return

      //透過dataset取得被點擊的頁數
     const page = Number(event.target.dataset.page)
     //轉成共同的變數讓list或card模式都能使用
      currentPage = page

      //更新畫面
      //先找出當前頁面樣式是什麼，就知道下一頁要顯示甚麼樣的樣式
      if (dataPanel.children[0].matches('.card')) {
      renderMovieListCard(getMoviesByPage(page))
      } else if (dataPanel.children[0].matches('.list')){
        renderMovieListList(getMoviesByPage(page));
      }
      
    })

    //電影清單加碼功能想法:
    //1. 先新增icon(html)
    //2. 先把list的頁面做好(html)
    //3. 裝監聽器，當點擊不同的icon就重新渲染頁面
    //4. 確認more和收藏功能都有運作
    //5. list頁面的分頁器製作
    //*後補充: 先點完頁面再轉換呈現的模式

    //有沒有搜尋完後點擊切換可以點到第一頁的模式?
  //showmode裝監聽器> 切換card or list mode
  showModeButton.addEventListener('click', function showModeButtonOnClicked (event) {
    let numberOfPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);

       if (event.target.matches(".cardmode")) {
         renderMovieListCard(getMoviesByPage(currentPage));
       }

       if (event.target.matches(".list")) {
         renderMovieListList(getMoviesByPage(currentPage));
       }
    
  })

  //搜尋後要顯示第一面的頁面，不然會抓到不存在的current Page (如在第5頁搜尋) > 顯示第一頁的頁面 > 點擊搜尋後結果的分頁 > 不同頁面切換show mode