import React from 'react'
import "./Modal.css";

const Modal = props => {

    if (!props.show) {
        return null
    }

    return(
        <div className="modal" onClick = {props.onClose}>
            <div className="modal-content" onClick = {e => e.stopPropagation()}>
                <div className="modal-header">
                    <h4 className="modal-title">Your NFT has been created</h4>
                </div>
                <div className="modal-footer">
                    <button onClick={props.onClick} className="modal-button">See your NFT in the store</button>
                </div>
            </div>
        </div>
    )
}

export default Modal