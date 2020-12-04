function queryBeer() {
  let url = 'http://dbpedia.org/sparql';
  let query = [
    'PREFIX dbpedia2: <http://dbpedia.org/resource/> PREFIX dbpedia2: <http://dbpedia.org/property/>',
    'select ?biere where{',
    '{{?biere dbo:product dbr:Beer.}',
    'UNION',
    '{?biere dbp:type dbr:Beer. }',
    'UNION',
    '{dbr:Beer dbo:product ?biere.}}',
    '}',
  ].join(' ');

  var queryURL = encodeURI(url + '?query=' + query + '&format=json');

  fetch(queryURL, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((data) => {
      let searchResult = document.getElementById('searchResult');
      console.log(data);
      let beers = data.results.bindings;
      for (let x in beers) {
        let link = beers[x].biere.value;
          let name = link.substring(link.lastIndexOf("/")+1);
          let line = document.createElement('a');
        line.setAttribute("href", "#");
        line.style.display = "block";
        line.addEventListener("click", () => console.log("test"));
        line.append(name);
        searchResult.appendChild(line);
      }
    });
}
