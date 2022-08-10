
$(function () {
    let query = { moves: []};
    const temtemSelector = $(`.form-select.temtem`);
    const recover = (stamina) => {
        if (stamina < 20) {
            return 2;
        } else if (stamina < 41) {
            return 3;
        } else if (stamina < 61) {
            return 4;
        } else if (stamina < 81) {
            return 5;
        } else {
            return 6;
        }
    }

    // Load Tems
    $.fn.temtems = async function() {
        return await $.get(`https://tem.team/api/v1/temtems?include=can_evolve&origin=churoll`);
    }

    $.fn.fetchTemtem = async function() {
        query.temtem = $(this).val();
        return await $.get(`https://tem.team/api/v1/temtems/${$(this).val()}?origin=churoll`); 
    }

    $.fn.calc = function() {
        console.log(query);
        let r = recover(query.stamina);
        let y = query.stamina;
        let total = 0, recovered = 0;
        for (let j = 0; j < query.moves.length; j++) {
            const move = query.moves[j];
            total += move.stamina * move.times;
            recovered += r * move.times;
        }
        const k = y + recovered;
        r = recover(k);
    
        let moves = [];
        for (let j = 0; j < query.moves.length; j++) {
            const move = query.moves[j];
            const x = (y - (move.stamina * move.times)) + r;
            moves.push(`${move.name} (x${move.times})`);
            y = x;
        }
        const required = query.stamina + (-y);
        $(`.result`).html(`
            <div class="col-md-12">
                <div>Stamina: <span class="fw-bold">${query.stamina}</span></div>
                <div>Recovered: <span class="fw-bold">${recovered}</span></div>
                <div>Total: <span class="fw-bold">${total}</span></div>
                <div>Required: <span class="fw-bold">${required}</span></div>
                <div>Moves: <span class="fw-bold">${moves.join(', ')}</span></div>
            </div>
        `);
    };

    const init = async () => {
        const { data: { temtems } } = await $(this).temtems();
        let options = temtems.map(r => `<option value="${r.number}"> ${r.name} </option>`);
        temtemSelector.append(options);
    };
    

    $(temtemSelector).on("change", async function(e) {
        const { data: { temtem: { techniques, base_stats: { stamina } } } } = await $(this).fetchTemtem();
        query.stamina = stamina;
        const { egg, level_up, training_course } = techniques;
        const techniquesArray = [...egg ?? [], ...level_up ?? [], ...training_course ?? []];
        const switches = techniquesArray.map(r => `<div class="col-md-2"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" role="switch" id="switch-${r.technique.name}" data-stamina="${r.technique.cost}" data-name="${r.technique.name}"><label class="form-check-label" for="switch-${r.technique.name}">${r.technique.name} ( x<input type="number" class="times" min="1" max="9" value="1"> )</label></div></div>`);
        $(".switches").html(switches);
    });

    $(document).on("click", ".form-check-input", function() {
        const { stamina, name } = $(this).data();
        const times = $(this).parent().find(".times").val();
        // Check if the switch is already in the array
        if (query.moves.find(r => r.name === name)) {
            query.moves = query.moves.filter(r => r.name !== name);
        } else {
            query.moves.push({ name, stamina, times: times });
        }
        $(this).calc();
    });

    $(document).on("change", ".times", function(e) {
        e.preventDefault();
        if ($(this).val() > 9) {
            $(this).val(9);
        }
        const name = $(this).parent().parent().find(".form-check-input").data("name");
        query.moves = query.moves.map(r => {
            if (r.name === name) {
                r.times = $(this).val();
            }
            return r;
        });
        $(this).calc();
    });

    init();
});