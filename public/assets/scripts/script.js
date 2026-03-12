const styleknoppie = document.querySelector('.opdrachtgever');
const newdesign = document.querySelector('.newdesign');
const olddesign = document.querySelector('.olddesign');


styleknoppie.addEventListener('click', () => {
    newdesign.classList.toggle('inactive');
    olddesign.classList.toggle('active');

});

// omdat alle popovers al in de html staan 
document.querySelectorAll('.zonepopover').forEach(zone => {
    const buttons = zone.querySelectorAll('.answer, .options button');
    const nextStep = zone.querySelector('.nextsteps');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('clicked'));
            nextStep.classList.remove('active');

            button.classList.add('clicked');

            if (button.classList.contains('correct')) {
                nextStep.classList.add('active');
            }
        });
    });

    const questcontent = zone.querySelector('.popoverquestion');
    const plantinfo = zone.querySelector('.popoverplantinfo');
    const detailsLinks = zone.querySelectorAll('.details');

    detailsLinks.forEach(button => {
        button.addEventListener('click', () => {

            detailsLinks.forEach(btn => btn.classList.toggle('clicked'));
            button.classList.toggle('clicked');

            if (questcontent) {
                questcontent.classList.toggle('inactive');
            }
            
            if (plantinfo) {
                plantinfo.classList.toggle('active');
            }
        });
    });
});

const styleToggle = document.querySelector('.opdrachtgever');

styleToggle.addEventListener('click', () => {
    styleToggle.classList.toggle('clicked');
});




// URL Cleanup logic for the Popover API
document.querySelectorAll('.opdracht-popover').forEach(popover => {
    popover.addEventListener('toggle', (event) => {
        if (event.newState === 'closed') {
            // Removes the #hash from the URL when the user closes the popover
            history.replaceState(null, document.title, window.location.pathname + window.location.search);
            
            // OPTIONAL: Reset the slider to the first question when closed
            popover.querySelector('ul').scrollTo({ left: 0 });
        }
    });
});


