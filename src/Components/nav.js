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
            <div className={"topnav" + (responsive? " responsive" : "")} >
                {/* <a href="#home" className="active">Tag</a> */}
                {onSignOut && <a href="#logout" onClick={signOut} className="bottom"><i className="fa fa-sign-out"></i></a>}
                {/* <a href="javascript:void(0);" className="icon" onclick={toogle}>
                    <i className="fa fa-bars"></i>
                </a> */}
            </div>
        </div>
    )
}

export default Nav;