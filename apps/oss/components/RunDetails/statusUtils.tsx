import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "failed":
      return <XCircle className="h-5 w-5 text-red-500" />
    case "running":
      return <Clock className="h-5 w-5 text-blue-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "running":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    default:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  }
}