const form = document.querySelector("section.top-banner form");
const input = document.querySelector(".container #searcİnput");
const msg = document.querySelector("span.msg");
const list = document.querySelector(".ajax-section ul.cities");

// console.log(list);
// list değişkeninde class tanımlarken class'ların arasında boşluk yoksa ".ajax-section.cities" tek elementte bu iki class var anlamı taşıyor.

//? token'ımızı açıkta tutmamalıyız bu yüzden kriptoluyoruz. Önce kriptolayarak şifreli tokeni alıyoruz sonra localstoragede şifreli olanı saklıyoruz. gerçek token'i silebiliriz.

// localStorage.setItem(
//   "tokenKeyEncrypted",
//   EncryptStringAES("601b4db5346620a012ec906f1ad3829e")
// );

localStorage.setItem(
  "tokenKey",
  "dMvFRjDiThrEevGuyndEzyADHg969ri4J8BuIRDVgwFZNEqxS/QFXPzj70Xmx1xa"
);

// localStorage.setItem("tokenKey", "RAPAIooyOVFdRNn7gPi6i8vUp3OJvy0Np5wgMGgNO0a2a258kya95/arqJmhPrWc");

// form kullanma sebebi veri submit edildiğinde sayfa yenileniyor.(form.reset()) ayrıca enter için ilave keydown vs tanımlamaya gerek yok
form.addEventListener("submit", (event) => {
  // preventDefault ile default görevlerini unut benim sana tanımladığım görevleri yap demiş oluyoruz.(burada otomatik submiti yapma sayfayı yenileme diyoruz.)
  event.preventDefault();
  getWeatherDataFromApi();
});

let lang = "tr";
let units = "metric";
let degree = "°C";

const getWeatherDataFromApi = async () => {
  // token'in şifresini extention dosyasındaki DecryptStringAES yöntemi ile çözerek çağırıyoruz. orjinal key hiç görünmedi.
  const tokenKey = DecryptStringAES(localStorage.getItem("tokenKey"));
  //   console.log(tokenKey);
  //   alert(tokenKey);

  // ?  keyden sonra apiyi aldığımız sitedeki dökumantasyona göre & ile ilave parametreler ekleyebiliriz. burada unit: ölçü birimi olarak metrik. lang: dil olarak tr'yi seçtik.

  //? postman ile api'yi test ediyoruz. Thunder'de aynı şeyi yapıyor ama Postman piyasada daha geçerli.
  console.log(tokenKey); // test etmek için yazdık,

  const inputValue = input.value;
  console.log(inputValue);

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputValue}&appid=${tokenKey}&units=${units}&lang=${lang}`;
  console.log(url);

  try {
    const response = await fetch(url).then((res) => res.json());
    //   axios yöntemi ilede yapalım.
    // const response = await axios(url);

    console.log(response);
    //* axios yöntemi ile yapınca gelen veri farklı geliyor. ama datanın içerisinde geliyor. o yüzden response.data desc edilmeli.
    let { main, sys, weather, name } = response;
    // const { main, sys, weather, name } = response.data; //!axios için
    name = name.replace(" Province", "");

    const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
    const iconUrlAWS = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0].icon}.svg`;

    //* tekrarı önlemek için kartlar oluşmadan önce sorgulama/filitreleme yapmak lazım
    //!document. demedi, önceden oluşturulan değişkenden devam etti
    const cityNameSpans = list.querySelectorAll(".city span");
    // NodeList'den array'a çevirdik filter uygulamak için.
    const cityNameSpansArray = Array.from(cityNameSpans);
    if (cityNameSpansArray.length > 0) {
      const filteredArray = cityNameSpansArray.filter(
        (span) => span.innerText == name
      );
      if (filteredArray.length > 0) {
        //* sonuç sıfırdan büyük olacağı için direk uyarı versin, yani eşleşme var
        msg.innerText = `You already know the weather for ${name}, Please search for another city 😉`;
        setTimeout(() => {
          msg.innerText = "";
        }, 5000);
        // 5sn sonra mesaj kaybolsun
        form.reset();
        return;
      }
    }
    //* best practise önce create etmektir.
    const createdLi = document.createElement("li");
    createdLi.classList.add("city");
    createdLi.innerHTML = `<h2 class="city-name" data-name="${name}, ${
      sys.country
    }">
                              <span>${name}</span>
                              <sup>${sys.country}</sup>
                          </h2>
                          <div class="city-temp">${Math.round(
                            main.temp
                          )}<sup>${degree}</sup></div>
                          <figure>
                              <img class="city-icon" src="${iconUrl}">
                              <figcaption>${weather[0].description}</figcaption>
                          </figure>`;
    //* figure ve figcaption kullanımı:  SEO açısından google algoritmasında daha öncelikli

    //append vs prepend
    // list.append(createdLi); // sona ekliyor
    list.prepend(createdLi); // prepend son yazılanı başa ekliyor.

    //! Capturing--> ile ikonları değştirme
    createdLi.addEventListener("click", (e) => {
      if (e.target.tagName == "IMG") {
        //*tagnme büyük harf gelir.
        e.target.src = e.target.src == iconUrl ? iconUrlAWS : iconUrl;
      }
      // else if (e.target.classList.contains("city-temp")) {
      //   units == "metric" ? (units = "imperial") : (units = "metric");
      //   degree == "°C" ? (degree = "°F") : (degree = "°C");
      //   console.log(units);
      //   console.log(degree);
      //   e.target.innerHTML = `
      //     <div class="city-temp">${units}<sup>${degree}</sup></div>
      //     `;
      // }
    });

    //Bubbling
    // createdLi.addEventListener("click", (e) => {
    //   alert(`LI element is clicked!!`);
    //   window.location.href = "https://clarusway.com";
    // });
    // createdLi.querySelector("figure").addEventListener("click", (e)=>{
    //     alert(`FIGURE element is clicked!!`);
    //     //STOP BUBBLING
    //     //e.stopPropagation();
    //     // window.location.href = "https://clarusway.com";
    // });
    // createdLi.querySelector("img").addEventListener("click", (e)=>{
    //     alert(`IMG element is clicked!!`);
    //     // window.location.href = "https://clarusway.com";
    // });

    //? form'un reset yöntemini kullanarak focus'ladık.
    //* olmayan şehirde hata verdirmek için
  } catch (error) {
    msg.innerText = `404 (City Not Found)`;
    setTimeout(() => {
      msg.innerText = "";
    }, 3000); // 3sn sonra mesaj kaybolsun
  }
  form.reset(); // inputu temizlemek için
};

document.querySelector(".options").addEventListener("click", (e) => {
  if (e.target.parentElement.classList.contains("languages")) {
    lang = e.target.value;
    // lang = e.target.textContent;
    // console.log(e.target);
    // } else if (e.target.value == "en") {
    //   lang = e.target.value;
    // } else if (e.target.value == "fr") {
    //   lang = e.target.value;
  } else if (e.target.parentElement.classList.contains("switch")) {
    units = e.target.value;
    degree = e.target.nextElementSibling.id;
  }
  // if (e.target.value == "tr") {
  //   lang = e.target.value;
  // } else if (e.target.value == "en"){
  //   lang = e.target.value;
  // } else if (e.target.value == "fr"){
  //   lang = e.target.value;
  // } else if(e.target.value == "metric"){
  //   units = e.target.value;
  //   degree = e.target.nextElementSibling.innerText
  // } else if(e.target.value == "imperial"){
  //   units = e.target.value;
  //   degree = e.target.nextElementSibling.innerText
  // }
});

//window onload
document.querySelector(".cities").addEventListener("click", (e) => {
  if (e.target.tagName == "IMG") {
    alert("img is clicked!!!");
  }
});
