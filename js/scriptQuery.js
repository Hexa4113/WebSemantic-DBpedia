function queryBeer() {
  let url = 'http://dbpedia.org/sparql';
  let query = [
    'PREFIX dbpedia2: <http://dbpedia.org/resource/> PREFIX dbpedia2: <http://dbpedia.org/property/>',
    'PREFIX plg: <http://purl.org/linguistics/gold/>',
    'SELECT DISTINCT ?beer WHERE {',

    '{',
    '{?beer dbp:type dbr:Beer. }',
    'UNION',
    '{?e skos:broader  dbc:Beer_by_country.',
    '?beer dct:subject ?e .}',
    'UNION',
    '{?beer plg:hypernym dbr:Beer}',
    '}',

    'Minus',
    '{?beer rdfs:label ?label.',
    'filter regex(?label, "Beer in"). }',
    'Minus',
    '{?beer rdfs:label ?label.',
    'filter regex(?label, "Brewer"). }',
    'Minus',
    '{?beer rdfs:label ?label.',
    'filter regex(?label, "List"). }',
    'Minus',
    '{?beer dbo:type dbr:Brewery.}',
    'Minus',
    '{?beer dbo:type dbr:Brewing.}',
    'Minus',
    '{?beer dbo:type dbo:Company.}',
    'Minus',
    '{?beer rdf:type dbo:Company.}',
    'Minus',
    '{?beer rdf:type dbo:Brewery.}',
    'Minus',
    '{?beer plg:hypernym dbr:Museum}',
    'Minus',
    '{?beer plg:hypernym dbr:Brewery}',
    'Minus',
    '{?beer plg:hypernym dbr:Company}',
    'Minus',
    '{?beer plg:hypernym dbr:Group}',
    '}',
    'ORDER BY ASC(?beer)',
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
        let link = beers[x].beer.value;
        let name = link.substring(link.lastIndexOf('/') + 1);
        let line = document.createElement('a');
        line.setAttribute('href', '#');
        line.setAttribute('link', link);
        line.style.display = 'block';
        line.addEventListener('click', () => console.log('test'));
        line.append(name);
        searchResult.appendChild(line);
      }
    });
}
