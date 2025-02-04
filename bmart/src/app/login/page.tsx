import Link from 'next/link'


const login: React.FC = () => {
    return (
        <div className="loginBackground">
            <div className="loginContainer">
                <img 
                    src="logo2.png" 
                    alt="login page logo" 
                    className="logoLogin"
                />

                <Link href="/" className="loginButton">Login button goes here</Link>

                <p className="boldText">Please sign in with your google email</p>
            </div>
        </div>
    )
}

export default login;