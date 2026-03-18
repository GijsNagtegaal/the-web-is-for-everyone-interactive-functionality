const back = document.querySelector('.back');

back.addEventListener('click', (event) => {

    event.preventDefault();

    if (window.history.length > 1) {
        window.history.back();
    }
});




// URL Cleanup logic for the Popovers
document.querySelectorAll('.opdracht-popover').forEach(popover => {
    popover.addEventListener('toggle', (event) => {
        if (event.newState === 'closed') {
            // Removes the #hash from the URL when the user closes the popover
            history.replaceState(null, document.title, window.location.pathname + window.location.search);
            
            // Reset the slider to the first question when closed
            popover.querySelector('ul').scrollTo({ left: 0 });
        }
    });
});


