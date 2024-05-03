import { getAccessIdOrRedirect } from "../Company/CompanyInformation"


function Dashboard() {
  const accessId = getAccessIdOrRedirect();

  return (

    <h1>{accessId}

    </h1>

  )
}

export default Dashboard
