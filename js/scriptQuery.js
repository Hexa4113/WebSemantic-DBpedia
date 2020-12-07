let allBeers = [];

async function queryBeer() {
  let url = 'http://dbpedia.org/sparql';
  let query = [
    'PREFIX dbpedia2: <http://dbpedia.org/resource/> PREFIX dbpedia2: <http://dbpedia.org/property/>',
    'PREFIX plg: <http://purl.org/linguistics/gold/>',
    'SELECT DISTINCT ?beer WHERE {',

    '{',
    '{?beer dbp:type dbr:Beer.}',
    'UNION',
    '{?beer plg:hypernym dbr:Beer}',
    'UNION',
    '{?e skos:broader  dbc:Beer_by_country.',
    '?beer dct:subject ?e .}}',

    'Minus',
    '{?beer dbo:product dbr:Beer}',
    'Minus',
    '{?beer rdfs:label ?label.',
    'filter regex(?label, "(Bierbrouwers|Smithwick\'s Experience|Society|Brouwerij|High council|New Garden|Beer Festival|Beer Awards|National Beer Day|List|[Bb]eer in|[Bb]rewer|[Bb]rewhouse|[Bb]rasserie|film|[Bb]rewing|[Cc]ompany|Champion|Guide)"). }',
    '}',
    'ORDER BY ASC(?beer)',
  ].join(' ');

  var queryURL = encodeURI(url + '?query=' + query + '&format=json');

  await fetch(queryURL, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      let beers = data.results.bindings;
      for (let x in beers) {
        let link = beers[x].beer.value;
        let name = link.substring(link.lastIndexOf('/') + 1);
        let formattedName = name.replaceAll('_', ' ');

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
  let divInfos = document.getElementById('beerInfos');
  var input = document.getElementById('searchBar');
  let beer = allBeers.find((x) => x.name == input.value);
  if (!beer) {
    document.querySelector('.notfoundbeer').style.display = 'block';
    console.log('Beer not found');
    divInfos.innerHTML = '';
  } else {
    document.querySelector('.notfoundbeer').style.display = 'none';
    var url = 'http://dbpedia.org/sparql';
    var query = [
      'PREFIX dbr: <http://dbpedia.org/resource/>',
      'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
      'PREFIX dbpedia: <http://dbpedia.org/>',
      'SELECT ?comment ?label ?origin ?origin2',
      'WHERE {',
      '{ <http://dbpedia.org/resource/' + beer.id + '> rdfs:comment ?comment }',
      'UNION',
      '{ <http://dbpedia.org/resource/' + beer.id + '> rdfs:label ?label }',
      'UNION',
      '{ <http://dbpedia.org/resource/' + beer.id + '> <http://dbpedia.org/ontology/origin> ?origin }',
      'UNION',
      '{ <http://dbpedia.org/resource/' + beer.id + '> <http://purl.org/dc/terms/subject> ?origin2 }',
      '}',
    ].join(' ');
    console.log(query);

    let queryURL = encodeURI(url + '?query=' + query + '&format=json');
    queryURL = queryURL.replace(/#/g, '%23');
    await fetch(queryURL, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Data', data);
        let res = data.results.bindings;

        let desc = document.createElement('div');
        let origin = document.createElement('div');
        let originFound = false;
        for (let i = 0; i < res.length; i++) {
          console.log(res[i]);
          if (res[i].comment && res[i].comment['xml:lang'] == 'en') {
            desc.innerHTML = '<strong>Description</strong> : ' + res[i].comment.value;
          } else if (res[i].origin) {
            let o = res[i].origin.value;
            let val = o.substring(o.lastIndexOf('/') + 1);
            origin.innerHTML = '<strong>Origin</strong> : ' + val;
            originFound = true;
          } else if (res[i].origin2 && !originFound) {
            const regex = /^http:\/\/dbpedia\.org\/resource\/Category:Beer_in.+$/gm;
            if (res[i].origin2.value.match(regex)) {
              let val = res[i].origin2.value.substring(res[i].origin2.value.lastIndexOf('_') + 1);
              origin.innerHTML = '<strong>Origin</strong> : ' + val;
            }
          }
        }
        divInfos.innerHTML = '';
        divInfos.appendChild(desc);
        divInfos.appendChild(origin);
        divInfos.style.display = 'block';
      });
  }
}

function setAutoComplete() {
  let input = document.getElementById('searchBar');
  input.addEventListener('input', (e) => {
    let value = e.target.value;
    console.log(value);

    let searchResult = document.getElementById('searchResult');
    searchResult.innerHTML = '';

    for (let i = 0; i < allBeers.length; i++) {
      if (allBeers[i].name.substring(0, value.length).toUpperCase() == value.toUpperCase() && value.length >= 2) {
        let res = allBeers[i].name;
        let b = document.createElement('div');
        b.innerHTML = '<strong>' + res + '</strong>';

        b.addEventListener('click', (event) => {
          input.value = event.target.textContent;
          closeList();
        });
        if (searchResult.childElementCount < 6) searchResult.appendChild(b);
        console.log('match : ' + allBeers[i].name);
      }
    }
  });
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function closeList() {
  let searchRes = document.getElementById('searchResult');
  searchRes.innerHTML = '';
}
