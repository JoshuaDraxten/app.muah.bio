import netlifyIdentity from 'netlify-identity-widget';
import getUser from '../api/getUser';

function modifyNetlifyAuth(){
    const tryAgainLater = () => {
        setTimeout( modifyNetlifyAuth, 100 );
        console.log("waiting...")
        return;
    }

    const modal = document.getElementById("netlify-identity-widget");
    if (!modal) return tryAgainLater()

    const modalDocument = modal.contentDocument;
    if ( modalDocument.body.innerHTML === '' ) return tryAgainLater();
  
    // Remove close button and callout
    [...modalDocument.querySelectorAll(".btnClose, .callOut")].forEach(
      node => node.style.display = 'none'
    );
}
modifyNetlifyAuth();

netlifyIdentity.init({ locale: 'en' });

export default ({ setCurrentUser, setUserInformation }) => {

    netlifyIdentity.on('login', user => {
        console.log( 'logged in' )
        setCurrentUser( user );
        netlifyIdentity.close();
        getUser( user.id ).then( response => {
            setUserInformation( response )
        })
    } );

    netlifyIdentity.on('logout', user => {
        console.log( user, "logged out" );
        window.location = window.location.origin
    } );

    netlifyIdentity.open('signup');
    return null;
}