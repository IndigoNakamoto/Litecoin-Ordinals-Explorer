export default function Page() {

    return(
        <div className="mx-auto p-4 max-w-screen-xl">
            <h1 className="text-2xl font-bold">
                Inscribe
            </h1>
        </div>
    )
}


/*
User Flow
User -> Sign In -> Choose OAuth Provider -> Authenticate and Authorize ->
OAuth Provider -> Authorization Code -> Application (NextAuth.js) ->
Exchange Code for Token -> Authorized Session -> User Uploads File ->
Application Processes and Inscribes Data -> Confirmation to User 

*/