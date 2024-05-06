import React, { useCallback, useEffect, useState } from "react"
import {
    withStreamlitConnection,
    Streamlit,
    ComponentProps,
} from "streamlit-component-lib"
import { useMsalInstance } from "./auth/msal-auth";

const Authentication = ({ args }: ComponentProps) => {
    const msalInstance = useMsalInstance(args["auth"], args["cache"])
    const loginRequest = args["login_request"] ?? undefined
    const logoutRequest = args["logout_request"] ?? undefined
    const loginButtonText = args["login_button_text"] ?? ""
    const logoutButtonText = args["logout_button_text"] ?? ""
    const buttonClass = args["class_name"] ?? ""
    const buttonId = args["html_id"] ?? ""
    const hideButton = args["hide_button"] ?? ""
    const hideButtonText = args["hide_button_text"] ?? ""

    const [loginToken, setLoginToken] = useState(null)

    const isAuthenticated = useCallback(
        async () => {
            const result = await msalInstance;
            return result.getAllAccounts().length > 0;
        }, []);

    useEffect(() => {
        const fetchAccounts = async () => {
            const instance = await msalInstance;
            if (instance.getAllAccounts().length > 0) {
                instance.acquireTokenSilent({
                    ...loginRequest,
                    account: instance.getAllAccounts()[0]
                }).then(function (response) {
                    // @ts-ignore
                    setLoginToken(response)
                }).catch(
                    function (error) {
                        setLoginToken(null)
                    }
                )
            } else {
                setLoginToken(null)
            }
        };
    
        fetchAccounts().then();
    }, [])

    

    useEffect(() => {
        Streamlit.setComponentValue(loginToken)
        Streamlit.setFrameHeight()
        Streamlit.setComponentReady()
    }, [loginToken])

    const loginPopup = useCallback(async () => {
        const instance = await msalInstance;
        instance.loginPopup(loginRequest).then(function (response) {
            // @ts-ignore
            setLoginToken(response)
        }).catch(console.error)
    }, [])

    const logoutPopup = useCallback(async () => {
        // @ts-ignore
        const instance = await msalInstance;
        instance.logoutPopup(logoutRequest).then(function (response) {
            setLoginToken(null)
        }).catch(console.error)
    }, [])

    return (
        <div className="card">
            {hideButton && loginToken ?
                <h3>{hideButtonText}</h3> 
                :
                <button onClick={loginToken ? logoutPopup : loginPopup} className={buttonClass} id={buttonId}>
                    {loginToken ? logoutButtonText : loginButtonText}
                </button>
            }
        </div>
    )

}

export default withStreamlitConnection(Authentication)
