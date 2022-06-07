import './loading.css';

const Loading = (props) => 
    {props.full?
        <div className="loading-full">
            <div className="lds-dual-ring" style={{display:props.visible?"inherit":"none"}} ></div>
        </div>
        :
        <div className="lds-dual-ring" style={{display:props.visible?"inherit":"none"}} ></div>
    }

export default Loading;