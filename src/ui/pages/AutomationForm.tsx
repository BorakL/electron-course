const AutomationForm = () => {
    const sendData = async () => {
        try{
            const data = await window.electronApp.fillABsoftForm();
            console.log("data",data)
        }catch(error){
            console.log("error",error)
        }
    }

    return(
        <>
            <h1>AutomationForm</h1>
            <button onClick={sendData}>Proba</button>
        </>
    )
}

export default AutomationForm