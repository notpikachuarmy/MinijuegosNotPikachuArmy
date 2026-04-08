let playersData = [];
let minigames = [];

// Usar PapaParse para leer el archivo CSV local
Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vQgwW9yS4QZtliVJQFFZbfQ-ImKFcBJz2WXruifo9AqIfdB_ClQlkg7ZHOLBsGZ3wikLoO-Wl_kQwmM/pub?output=csv", {
    download: true,
    header: true,
    dynamicTyping: true, // Convierte números automáticamente
    complete: function(results) {
        processData(results.data);
    },
    error: function(err) {
        document.getElementById('leaderboard').innerHTML = '<p>Error al cargar datos.csv. Asegúrate de que el archivo exista.</p>';
    }
});

function processData(data) {
    // Filtrar filas vacías
    data = data.filter(row => row.Jugador != null);

    // Identificar cuáles son los minijuegos (excluyendo Jugador y Avatar)
    if(data.length > 0) {
        minigames = Object.keys(data[0]).filter(key => key !== 'Jugador' && key !== 'Avatar');
        populateSelect(minigames);
    }

    // Calcular la puntuación global para cada jugador
    playersData = data.map(player => {
        let globalPoints = 0;
        minigames.forEach(game => {
            // Si la celda está vacía, se suma 0
            globalPoints += (player[game] || 0); 
        });
        player.global = globalPoints;
        return player;
    });

    // Renderizar por defecto: Puntuación Global
    renderLeaderboard('global');
}

function populateSelect(games) {
    const select = document.getElementById('sortSelect');
    games.forEach(game => {
        const option = document.createElement('option');
        option.value = game;
        option.textContent = game;
        select.appendChild(option);
    });

    // Añadir evento para reordenar cuando cambie la selección
    select.addEventListener('change', (e) => {
        renderLeaderboard(e.target.value);
    });
}

function renderLeaderboard(sortBy) {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = ''; // Limpiar lista

    // Ordenar de mayor a menor dependiendo de la selección
    const sortedPlayers = [...playersData].sort((a, b) => {
        const scoreA = a[sortBy] || 0;
        const scoreB = b[sortBy] || 0;
        return scoreB - scoreA;
    });

    sortedPlayers.forEach((player, index) => {
        const rankPos = index + 1;
        const rankClass = rankPos <= 3 ? `rank-${rankPos}` : '';
        
        // Puntos a mostrar bajo el nombre (Global o el específico del minijuego)
        const displayPoints = sortBy === 'global' ? 
            `${player.global} Puntos Globales` : 
            `${player[sortBy] || 0} Puntos en ${sortBy}`;

        // Crear la fila del jugador
        const row = document.createElement('div');
        row.className = 'player-row';

        // Generar los iconos de minijuegos
        let badgesHtml = '';
        minigames.forEach(game => {
            const points = player[game] || 0;
            // El atributo 'title' es el que hace que el texto aparezca al pasar el ratón
            badgesHtml += `
                <img src="iconos/${game}.png" 
                     class="badge" 
                     title="${game}: ${points} puntos" 
                     alt="${game}"
                     onerror="this.src='https://via.placeholder.com/32?text=?'"> 
            `;
        }); // El 'onerror' pone un icono de placeholder si olvidas subir la imagen de un minijuego

        // Estructura HTML de la fila
        row.innerHTML = `
            <div class="rank ${rankClass}">${rankPos}.</div>
            <img src="${player.Avatar}" alt="Avatar de ${player.Jugador}" class="avatar" onerror="this.src='https://via.placeholder.com/48?text=?'">
            <div class="player-info">
                <h3 class="player-name">${player.Jugador}</h3>
                <p class="player-points">${displayPoints}</p>
            </div>
            <div class="badges-container">
                ${badgesHtml}
            </div>
        `;

        leaderboard.appendChild(row);
    });
}
