const text = document.getElementById('text-content');
const login = document.getElementById('login-overlay');
const gameBox = document.getElementById('game-box');
const frame = document.getElementById('game-frame');
const panicChip = document.getElementById('panic-chip');
const gameGrid = document.getElementById('hub-grid');
const liveCountEls = document.querySelectorAll('[data-live-count]');
let clicks = 0;

const library = {
  home: `<h1>The Darwin Collection</h1>
      <p>Welcome to the digital repository. This archive presents a curated introduction to the published works, notebooks, and correspondence of Charles Darwin, gathered into a reading experience modeled after a traditional library exhibition.</p>
      <p>Rather than serving as a simple catalog, the collection is organized to highlight the long arc of Darwin's intellectual development. Visitors can trace how his early observations in geology, zoology, and comparative anatomy slowly accumulated into broader questions about variation, inheritance, and the history of life.</p>
      <p>The materials represented here also reflect the collaborative nature of nineteenth-century science. Darwin's research depended on an enormous network of ship captains, breeders, botanists, pigeon fanciers, collectors, and family members who supplied specimens, answered questionnaires, and challenged his interpretations.</p>
      <p>Use the navigation to explore key themes from his career, including the Beagle voyage and the theory of natural selection. Each article offers a concise overview designed to place Darwin's better-known ideas within the richer historical context in which they were formed.</p>`,
  voyage: `<h1>The HMS Beagle Voyage</h1>
      <p>From 1831 to 1836, Darwin sailed aboard HMS <em>Beagle</em> as a gentleman naturalist on a surveying expedition that carried him around the world. Although he had recently completed his studies at Cambridge, the journey became the true beginning of his scientific career, exposing him to landscapes, fossils, and living species on a scale no classroom could have provided.</p>
      <p>During stops in South America, Darwin studied uplifted coastlines, collected the remains of extinct mammals, and compared them with living species occupying similar regions. These experiences encouraged him to think historically about the natural world, asking not only how organisms were classified, but how environments and populations changed over time.</p>
      <p>The Galapagos Islands later gained special fame, yet they were only one part of a much broader set of observations. Darwin kept detailed notes on mockingbirds, finches, tortoises, coral reefs, earthquakes, and tropical forests, gradually learning that geographical isolation often coincided with distinct local forms of plants and animals.</p>
      <p>By the time he returned to England, Darwin possessed not a finished theory but a vast archive of evidence and questions. The voyage supplied the specimens, notebooks, and habits of close observation that would support decades of later research and ultimately shape modern evolutionary biology.</p>`,
  selection: `<h1>Theory of Natural Selection</h1>
      <p>Darwin's theory of natural selection proposed that species are not fixed, but change over generations as heritable variations are filtered through the pressures of survival and reproduction. Individuals within a population differ from one another, and when some of those differences help organisms leave more offspring, those traits tend to become more common over time.</p>
      <p>This idea allowed Darwin to explain adaptation without appealing to separate acts of creation for each species. Features such as camouflage, specialized beaks, or intricate floral structures could emerge gradually through the accumulation of many small advantages, preserved because they improved success in particular environments.</p>
      <p>Darwin developed the argument cautiously, drawing analogies from artificial selection practiced by breeders and supporting his claims with evidence from biogeography, embryology, comparative anatomy, and the fossil record. He understood that the theory would be controversial, so he spent years assembling examples before publishing <em>On the Origin of Species</em> in 1859.</p>
      <p>The resulting framework transformed biology by uniting diverse observations under a single historical process. Although later genetics refined the mechanisms of inheritance, natural selection remains one of the central principles of modern science because it explains both the diversity of life and the fit between organisms and their environments.</p>`
};

function showArticle(id) {
  panic();
  text.innerHTML = library[id] || library.home;
}

function triggerSecret() {
  clicks++;
  if (clicks >= 3) {
    login.style.display = 'block';
    clicks = 0;
  }
}

function launch(file) {
  login.style.display = 'none';
  gameBox.style.display = 'block';
  panicChip.style.display = 'inline-flex';
  frame.src = file;
  frame.focus();
}

function panic() {
  gameBox.style.display = 'none';
  login.style.display = 'none';
  panicChip.style.display = 'none';
  frame.src = '';
  text.innerHTML = library.home;
}

function renderCatalog() {
  const games = window.archiveGameCatalog || [];
  const totalGames = games.length + 1;
  liveCountEls.forEach(el => {
    el.textContent = `${totalGames} experiences online`;
  });
  gameGrid.innerHTML = games.map(game => `
    <article class="game-card">
      <div class="game-thumb ${game.thumbClass || ''}"><span>${game.tagline}</span></div>
      <div class="game-card-top">
        <div>
          <h4>${game.title}</h4>
          <p class="game-meta"><span>${game.players}</span><span>${game.genre}</span></p>
        </div>
        <span class="rating-badge">${game.rating}</span>
      </div>
      <button class="play-button" onclick="launch('${game.file.replace(/'/g, "\\'")}')">Play now</button>
    </article>
  `).join('');
}

window.showArticle = showArticle;
window.triggerSecret = triggerSecret;
window.launch = launch;
window.panic = panic;

window.addEventListener('keydown', function(event) {
  if (event.code === 'ShiftRight') panic();
});

frame.onload = function() {
  try {
    frame.contentWindow.addEventListener('keydown', function(event) {
      if (event.code === 'ShiftRight') {
        window.panic();
      }
    });
  } catch (error) {
    console.log('Cross-origin game detected. Using top-level panic chip fallback.');
  }
};

renderCatalog();
showArticle('home');
