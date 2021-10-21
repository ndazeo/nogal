import { useState } from "react";
import './nav.css';

const Nav = (props) => {
    const [responsive, ] = useState(false);

    const { onSignOut } = props;

    // function toogle() {
    //     SetResponsive(!responsive);
    // }

    function signOut() {
        if(onSignOut) {
            onSignOut();
        }
    }
 
    return (
        <div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>

            <div class={"topnav" + (responsive? " responsive" : "")} >
                {/* <a href="#home" class="active">Tag</a> */}
                {onSignOut && <a href="#logout" onClick={signOut} class="bottom"><i class="fa fa-sign-out"></i></a>}
                {/* <a href="javascript:void(0);" class="icon" onclick={toogle}>
                    <i class="fa fa-bars"></i>
                </a> */}
            </div>
        </div>
    )
}

export default Nav;