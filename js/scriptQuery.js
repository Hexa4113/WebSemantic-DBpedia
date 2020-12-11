let allBeers = [];
/*
  {
    id: exampleID,
    name: exampleName,
    link: exampleLink
  }
*/

let allTypes = [];

async function queryBeer() {
  let url = 'http://dbpedia.org/sparql';
  let query = [
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
    '{?beer dct:subject dbc:Beer_styles}',
    'Minus',
    '{?beer dct:subject dbc:Types_of_beer}',
    'Minus',
    '{?beer rdfs:label ?label.',
    'filter regex(?label, "(Group|Anheuser-Busch InBev|Isle of Man Pure Beer Act|Group|Corporation|Compa|GABS Hottest 100 Aussie Craft Beers of the Year|trademark|Association|Holding|Beer in|Bierbrouwers|Smithwick\'s Experience|Society|Brouwerij|High council|New Garden|Beer Festival|Beer Awards|National Beer Day|List|[Bb]eer in|[Bb]rewer|[Bb]rewhouse|[Bb]rasserie|film|[Bb]rewing|[Cc]ompany|Champion|Guide)","i").}',
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
  queryAllTypes();
  queryBeersByType('Lager');
  window.location.href = 'http://localhost:5500/#typeOfBeerContainer';
}

async function queryInfosOnBeer(beerName) {
  let divInfos = document.querySelector('#beerInfos');
  let divBeerName = document.querySelector('#beerInfos .beerName');
  let tableInfos = document.getElementById('tableInfos');
  let tableBody = tableInfos.children[0];
  let title = document.querySelector('#beerInfos .infosTitles');
  let contents = document.querySelector('#beerInfos .infosContents');

  let beer = allBeers.find((x) => x.name == beerName);
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
      'SELECT ?comment ?label ?origin ?origin2 ?abv ?introduced ?year ?type ?brewery',
      'WHERE {',
      '{ <http://dbpedia.org/resource/' + beer.id + '> rdfs:comment ?comment }',
      'UNION',
      '{ <http://dbpedia.org/resource/' + beer.id + '> rdfs:label ?label }',
      'UNION',
      '{ <http://dbpedia.org/resource/' + beer.id + '> <http://dbpedia.org/ontology/origin> ?origin }',
      'UNION',
      '{ <http://dbpedia.org/resource/' + beer.id + '> <http://purl.org/dc/terms/subject> ?origin2 }',
      'UNION',
      '{ <http://dbpedia.org/resource/' + beer.id + '> <http://dbpedia.org/property/abv> ?abv }',
      'UNION',
      '{ <http://dbpedia.org/resource/' + beer.id + '> <http://dbpedia.org/property/introduced> ?introduced }',
      'UNION',
      '{ <http://dbpedia.org/resource/' + beer.id + '> <http://dbpedia.org/property/year> ?year }',
      'UNION',
      '{<http://dbpedia.org/resource/' + beer.id + '> dbp:style ?type}',
      'UNION',
      '{<http://dbpedia.org/resource/' + beer.id + '> dbo:manufacturer ?brewery}',

      'UNION',
      '{',
      '{{?type dct:subject dbc:Beer_styles.}',
      'UNION',
      '{?type dct:subject dbc:Types_of_beer.}}',
      
      '?type rdfs:label ?label.',
      '<http://dbpedia.org/resource/' + beer.id + '> dbo:abstract ?desc.',
      'filter regex(?desc,CONCAT("(", ?label, ")"),"i").',
      '}',
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

        let abv = document.createElement('div');

        let introduced = document.createElement('div');
        let introducedFound = false;

        let type = document.createElement('div');
        let tabType = [];

        let brewery = document.createElement('div');

        desc.innerHTML = 'Not found';
        origin.innerHTML = 'Not found';
        abv.innerHTML = 'Not found';
        introduced.innerHTML = 'Not found';
        type.innerHTML = 'Not found';
        brewery.innerHTML = 'Not found';

        for (let i = 0; i < res.length; i++) {
          console.log(res[i]);
          if (res[i].comment && res[i].comment['xml:lang'] == 'en') {
            desc.innerHTML = res[i].comment.value;
          } else if (res[i].origin) {
            let o = res[i].origin.value;
            let val = o.substring(o.lastIndexOf('/') + 1);
            origin.innerHTML = "<a href='#countries' onclick=\"highlightCountry('"+val+"')\"> "+val+"</a>";
            originFound = true;
          } else if (res[i].origin2 && !originFound) {
            const regex = /^http:\/\/dbpedia\.org\/resource\/Category:Beer_in.+$/gm;
            if (res[i].origin2.value.match(regex)) {
              let val = res[i].origin2.value.substring(res[i].origin2.value.lastIndexOf('_') + 1);
              origin.innerHTML = "<a href='#countries' onclick=\"highlightCountry('"+val+"')\"> "+val+"</a>";
            }
          } else if (res[i].abv) {
            let val = res[i].abv.value;
            abv.innerHTML = val + ' %';
          } else if (res[i].introduced) {
            let val = res[i].introduced.value;
            introduced.innerHTML = val;
            introducedFound = true;
          } else if (res[i].year && !introducedFound) {
            let val = res[i].year.value;
            introduced.innerHTML = val;
          } else if (res[i].type) {
            let val = res[i].type.value.substring(res[i].type.value.lastIndexOf('/') + 1);

            if (!tabType.includes(val)) {
              tabType.push(val);
            }
          } else if (res[i].brewery) {
            let val = res[i].brewery.value.substring(res[i].brewery.value.lastIndexOf('/') + 1);
            brewery.innerHTML = "<a href='#brewery' onclick=\"highlightBreweryBeers('"+val+"')\"> "+val+"</a>";
          }

          //type.innerHTML = tabType.join(', ');
        }
        if (tabType.length > 0) {
          type.innerHTML = '';
          for (let i in tabType) {
            let a = document.createElement('div');
            console.log(a);
            a.innerHTML = tabType[i];

            type.appendChild(a);
            // type.innerHTML += a.innerHTML;
            a.addEventListener('click', () => {
              console.log('click type');
              closeModal();
              window.location.href = 'http://localhost:5500#typeOfBeers';
              queryBeersByType(tabType[i]);
              document.getElementById('selectTypeOfBeer').value = tabType[i];
            });
          }
        }

        tableBody.children[0].children[1].textContent = desc.innerHTML;
        tableBody.children[1].children[1].innerHTML = origin.innerHTML;
        tableBody.children[2].children[1].textContent = abv.innerHTML;
        tableBody.children[3].children[1].replaceWith(type);
        tableBody.children[4].children[1].innerHTML = brewery.innerHTML;
        // divInfos.textContent = '';
        divBeerName.textContent = '';
        divBeerName.textContent = beer.name;

        //divInfos.style.display = 'block';
        let modal = document.getElementById('modal-beer');
        displayModal();
        let btn = document.querySelector('#modal-beer button');
        btn.addEventListener('click', (e) => {
          closeModal();
        });

        window.addEventListener('click', (e) => {
          if (e.target == modal) {
            closeModal();
          }
        });
        // divInfos.style.transform = 'translateX(50%)'
      });
  }
}

async function queryAllTypes() {
  var url = 'http://dbpedia.org/sparql';
  var query = [
    'PREFIX plg: <http://purl.org/linguistics/gold/>',
    'SELECT DISTINCT ?type WHERE {',
    '{',
    '{{?type dct:subject dbc:Beer_styles.}',
    'UNION',
    '{?type dct:subject dbc:Types_of_beer.}}',
    '}',
    '}',
    'ORDER BY ASC(?type)',
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
      console.log(res);

      const containerList = document.querySelector('#typesOfBeer select');
      containerList.addEventListener('change', (e) => {
        console.log(e.target.value);
        queryBeersByType(e.target.value);
      });

      for (let i = 0; i < res.length; i++) {
        let option = document.createElement('option');
        let typeNoFormatted = res[i].type.value.substring(res[i].type.value.lastIndexOf('/') + 1);
        let typeFormatted = res[i].type.value.substring(res[i].type.value.lastIndexOf('/') + 1);
        typeFormatted = typeFormatted.replaceAll('_', ' ');
        option.setAttribute('value', typeNoFormatted);
        option.innerHTML = typeFormatted;
        containerList.appendChild(option);

        allTypes.push({ name: typeFormatted, id: typeNoFormatted, link: res[i].type.value });
      }
    });
}

async function queryBeersByType(type) {
  var url = 'http://dbpedia.org/sparql';
  var query = [
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
    '{?beer dct:subject dbc:Beer_styles}',
    'Minus',
    '{?beer dct:subject dbc:Types_of_beer}',
    'Minus',
    '{?beer rdfs:label ?label.',
    'filter regex(?label, "(Group|Anheuser-Busch InBev|Isle of Man Pure Beer Act|Group|Corporation|Compa|GABS Hottest 100 Aussie Craft Beers of the Year|trademark|Association|Holding|Beer in|Bierbrouwers|Smithwick\'s Experience|Society|Brouwerij|High council|New Garden|Beer Festival|Beer Awards|National Beer Day|List|[Bb]eer in|[Bb]rewer|[Bb]rewhouse|[Bb]rasserie|film|[Bb]rewing|[Cc]ompany|Champion|Guide)","i").}',

    '<http://dbpedia.org/resource/' + type + '> rdfs:label ?labelType.',
    '?beer dbo:abstract ?desc.',
    'filter regex(?desc,CONCAT("(", ?labelType, ")"),"i").',

    '}',

    'ORDER BY ASC(?beer)',
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
      console.log(res);
      let containerList = document.querySelector('#beersByType');
      containerList.innerHTML = '';
      for (let i = 0; i < res.length; i++) {
        const aBeer = allBeers.find((x) => x.link == res[i].beer.value);
        let divBeerType = document.createElement('div');
        divBeerType.className = 'beerType';
        divBeerType.innerHTML = aBeer.name;
        divBeerType.addEventListener('click', (e) => {
          queryInfosOnBeer(aBeer.name);
        });
        containerList.appendChild(divBeerType);
      }
    });
}

async function queryBeerByCountry(country) {
  var countryNameContainer = document.getElementById("countryName");
  var countryPrettier = country[0].toUpperCase() + country.substring(1);
  countryNameContainer.innerHTML= countryPrettier;
  var url = 'http://dbpedia.org/sparql';
  var query = [
    'PREFIX plg: <http://purl.org/linguistics/gold/>',
    'SELECT DISTINCT ?beer WHERE {',

    '{',
    '{?beer dbp:type dbr:Beer.}',
    'UNION',
    '{?beer plg:hypernym dbr:Beer}',
    'UNION',
    '{?e skos:broader  dbc:Beer_by_country.',
    '?beer dct:subject ?e .}}',

    '{?beer dct:subject ?origin.',
    'filter(regex(?origin,"' + country + '", "i") AND regex(?origin,"beer_in_","i"))}',

    'Minus',
    '{?beer dct:subject dbc:Beer_styles}',
    'Minus',
    '{?beer dct:subject dbc:Types_of_beer}',
    'Minus',
    '{?beer rdfs:label ?label.',
    'filter regex(?label, "(Group|Anheuser-Busch InBev|Isle of Man Pure Beer Act|Group|Corporation|Compa|GABS Hottest 100 Aussie Craft Beers of the Year|trademark|Association|Holding|Beer in|Bierbrouwers|Smithwick\'s Experience|Society|Brouwerij|High council|New Garden|Beer Festival|Beer Awards|National Beer Day|List|[Bb]eer in|[Bb]rewer|[Bb]rewhouse|[Bb]rasserie|film|[Bb]rewing|[Cc]ompany|Champion|Guide)","i").}',
    '}',

    'ORDER BY ASC(?beer)',
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
      console.log(res);
      let containerList = document.querySelector('#beerByCountry');
      containerList.innerHTML = '';
      
      for (let i = 0; i < res.length; i++) {
        const aBeer = allBeers.find((x) => x.link == res[i].beer.value);
        let divBeerType = document.createElement('div');
        divBeerType.className = 'beerType';
        divBeerType.innerHTML = aBeer.name;
        containerList.appendChild(divBeerType);
      }
    });
}

async function queryBeerByBrewery(brewery){
  var breweryNameContainer = document.getElementById("breweryName");
  var breweryPrettier = brewery[0].toUpperCase() + brewery.substring(1);
  breweryNameContainer.innerHTML= breweryPrettier;

  var url = 'http://dbpedia.org/sparql';
  var query = [
    'PREFIX plg: <http://purl.org/linguistics/gold/>',
    'SELECT DISTINCT ?beer WHERE {',
    '{',
    '{?beer dbo:manufacturer <http://dbpedia.org/resource/' + brewery + '>}',
    'Union',
    '{?beer dbp:brewery <http://dbpedia.org/resource/' + brewery + '>}',
    'Union',
    '{ ',
        '{{?beer dbp:type dbr:Beer.}',
        'UNION',
        '{?beer plg:hypernym dbr:Beer}',
        'UNION',
        '{?e skos:broader  dbc:Beer_by_country.',
        '?beer dct:subject ?e .}}',
    '?beer dbo:abstract ?description.',
    '<http://dbpedia.org/resource/' + brewery + '> rdfs:label ?label.',
    'filter regex(?description,CONCAT("(", ?label, ")"),"i").',
    '}',
    '}',
    'Minus',
    '{?beer dct:subject dbc:Beer_styles}',
    'Minus',
    '{?beer dct:subject dbc:Types_of_beer}',
    'Minus',
    '{?beer rdfs:label ?labeldeux.',
    'filter regex(?labeldeux, "(Beer in|Industrie|Grupo|trademark|Compa|Bierbrouwers|Smithwick\'s Experience|Society|Brouwerij|High council|New Garden|Beer Festival|Beer Awards|National Beer Day|List|[Bb]eer in|[Bb]rewer|[Bb]rewhouse|[Bb]rasserie|film|[Bb]rewing|[Cc]ompany|Champion|Guide)").',
    '}',
    'Minus',
    '{?beer dbo:type dbr:Public_company}',
    'Minus',
    '{?beer plg:hypernym dbr:Company}',
    '}',
    'ORDER BY ASC(?beer)',
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
      console.log(res);
      let containerList = document.querySelector('#beersByBrewery');
      containerList.innerHTML = '';
      
      for (let i = 0; i < res.length; i++) {
        const aBeer = allBeers.find((x) => x.link == res[i].beer.value);
        let divBeerType = document.createElement('div');
        divBeerType.className = 'beerType';
        divBeerType.innerHTML = aBeer.name;
        containerList.appendChild(divBeerType);
      }
    });
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

function displayModal() {
  let modal = document.getElementById('modal-beer');
  modal.style.left = '0%';
}

function closeModal() {
  let modal = document.getElementById('modal-beer');
  modal.style.left = '-100%';
}

function highlightCountry(countryName){
  var country_name = countryName.toLowerCase();
  closeModal();
  queryBeerByCountry(country_name);
}

function highlightBreweryBeers(brewery){
  closeModal();
  queryBeerByBrewery(brewery);
}
