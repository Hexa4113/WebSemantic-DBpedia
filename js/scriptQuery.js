let allBeers = [];

async function queryBeer() {
  let url = "http://dbpedia.org/sparql";
  let query = [
    "PREFIX dbpedia2: <http://dbpedia.org/resource/> PREFIX dbpedia2: <http://dbpedia.org/property/>",
    "PREFIX plg: <http://purl.org/linguistics/gold/>",
    "SELECT DISTINCT ?beer WHERE {",

    "{",
    "{?beer dbp:type dbr:Beer. }",
    "UNION",
    "{?e skos:broader  dbc:Beer_by_country.",
    "?beer dct:subject ?e .}",
    "UNION",
    "{?beer plg:hypernym dbr:Beer}",
    "}",

    "Minus",
    "{?beer rdfs:label ?label.",
    'filter regex(?label, "Beer in"). }',
    "Minus",
    "{?beer rdfs:label ?label.",
    'filter regex(?label, "Brewer"). }',
    "Minus",
    "{?beer rdfs:label ?label.",
    'filter regex(?label, "List"). }',
    "Minus",
    "{?beer dbo:type dbr:Brewery.}",
    "Minus",
    "{?beer dbo:type dbr:Brewing.}",
    "Minus",
    "{?beer dbo:type dbo:Company.}",
    "Minus",
    "{?beer rdf:type dbo:Company.}",
    "Minus",
    "{?beer rdf:type dbo:Brewery.}",
    "Minus",
    "{?beer plg:hypernym dbr:Museum}",
    "Minus",
    "{?beer plg:hypernym dbr:Brewery}",
    "Minus",
    "{?beer plg:hypernym dbr:Company}",
    "Minus",
    "{?beer plg:hypernym dbr:Group}",
    "}",
    "ORDER BY ASC(?beer)",
  ].join(" ");

  var queryURL = encodeURI(url + "?query=" + query + "&format=json");

  await fetch(queryURL, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      let beers = data.results.bindings;
      for (let x in beers) {
        let link = beers[x].beer.value;
        let name = link.substring(link.lastIndexOf("/") + 1);
        let formattedName = name.replaceAll("_", " ");

        let beer = {
          id: name,
          name: formattedName,
          link: link,
        };

        allBeers.push(beer);
      }
    });
  console.log(allBeers);
  setAutoComplete();
}

async function queryInfosOnBeer() {
  var input = document.getElementById("searchBar");
  let beer = allBeers.find((x) => x.name == input.value);
  console.log(beer);
  var url = "http://dbpedia.org/sparql";
  var query = [
    "PREFIX dbpedia: <http://dbpedia.org/resource/>",
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
    "SELECT ?comment ?label",
    "WHERE {",
    "{ <http://dbpedia.org/resource/" + beer.id + "> rdfs:comment ?comment }",
    "UNION",
    "{ <http://dbpedia.org/resource/" + beer.id + "> rdfs:label ?label }",
    "}",
  ].join(" ");
  console.log(query);

  let queryURL = encodeURI(url + "?query=" + query + "&format=json");
  queryURL = queryURL.replace(/#/g, "%23");
  await fetch(queryURL, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Data", data);
      let res = data.results.bindings;
      let divInfos = document.getElementById("beerInfos");
      let b = document.createElement("div");
      for (let i = 0; i < res.length; i++) {
        console.log(res[i]);
        if (res[i].comment && res[i].comment["xml:lang"] == "en") {
          b.textContent = res[i].comment.value;
        }
      }
      divInfos.innerHTML = "";
      divInfos.appendChild(b);
      divInfos.style.display = "block";
    });
}

function setAutoComplete() {
  let input = document.getElementById("searchBar");
  input.addEventListener("input", (e) => {
    let value = e.target.value;
    console.log(value);

    let searchResult = document.getElementById("searchResult");
    searchResult.innerHTML = "";

    for (let i = 0; i < allBeers.length; i++) {
      if (allBeers[i].name.substring(0, value.length).toUpperCase() == value.toUpperCase() && value.length >= 2) {
        let res = allBeers[i].name;
        let b = document.createElement("div");
        b.innerHTML = "<strong>" + res + "</strong>";

        b.addEventListener("click", (event) => {
          input.value = event.target.textContent;
        });
        if (searchResult.childElementCount < 6) searchResult.appendChild(b);
        console.log("match : " + allBeers[i].name);
      }
    }
  });
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function closeList() {
  let searchRes = document.getElementById("searchResult");
  searchRes.innerHTML = "";
}
