import { Plus } from "lucide-react"
import { Card } from "@/components/ui/card"

export function AddDefinitionCard() {
  return (
    <Card className="flex flex-col border-dashed border-2 bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground text-center mb-4">Create a new test definition</p>
      </div>
    </Card>
  )
}
