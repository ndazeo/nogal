import './loading.css';

const Loading = (props) => 
    <div className="lds-dual-ring" style={{display:props.visible?"inherit":"none"}} ></div>

export default Loading;