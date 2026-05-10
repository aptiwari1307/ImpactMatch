document.addEventListener('DOMContentLoaded', () => {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      renderCampaigns(data.featuredNgos);
    })
    .catch(error => console.error('Error fetching data:', error));
});

function renderCampaigns(campaigns) {
  const container = document.getElementById('campaignsGrid');
  if(!container) return;
  campaigns.forEach(campaign => {
    const card = document.createElement('div');
    card.className = 'campaign-card';
    card.innerHTML = `
      <img src="${campaign.image}" alt="${campaign.title}" class="campaign-img">
      <div class="campaign-info">
        <div class="funding-stat raised">
          Raised
          <span>${campaign.raised}</span>
        </div>
        <div class="funding-percent">
          ${campaign.raisedPercent}
        </div>
        <div class="funding-stat raised" style="align-items: flex-end; text-align: right;">
          Goal
          <span>${campaign.target}</span>
        </div>
      </div>
      <div class="campaign-content">
        <h3>${campaign.title}</h3>
        <p>${campaign.description}</p>
      </div>
      <button class="campaign-arrow" aria-label="Support Initiative">
        <i class="fa-solid fa-arrow-right"></i>
      </button>
    `;
    container.appendChild(card);
  });
}
