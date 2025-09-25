"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useTestDefinitionForm } from "./useTestDefinitionForm"
import { ManualForm } from "./ManualForm"
import { GitHubForm } from "./GitHubForm"

import type { Definition } from "@tatou/core/types"

interface DefinitionFormProps {
  existingTest?: Definition
}

export function DefinitionForm({ existingTest }: DefinitionFormProps) {
  const {
    isSubmitting,
    tab,
    setTab,
    executors,
    isLoadingExecutors,
    formData,
    setFormData,
    githubUrl,
    setGithubUrl,
    githubPath,
    setGithubPath,
    addCommand,
    removeCommand,
    updateCommand,
    handleSubmit,
    handleGithubSubmit,
  } = useTestDefinitionForm({ 
    initialDefinition: existingTest, 
    mode: existingTest ? "edit" : "create" 
  })

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        <TabsTrigger value="github">Git-backed (GitHub)</TabsTrigger>
      </TabsList>
      <TabsContent value="manual">
        <ManualForm
          formData={formData}
          setFormData={setFormData}
          executors={executors}
          isLoadingExecutors={isLoadingExecutors}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          addCommand={addCommand}
          removeCommand={removeCommand}
          updateCommand={updateCommand}
          existingTest={existingTest}
        />
      </TabsContent>
      <TabsContent value="github">
        <GitHubForm
          githubUrl={githubUrl}
          setGithubUrl={setGithubUrl}
          githubPath={githubPath}
          setGithubPath={setGithubPath}
          isSubmitting={isSubmitting}
          handleGithubSubmit={handleGithubSubmit}
        />
      </TabsContent>
    </Tabs>
  )
}

// Re-export for backward compatibility
export default DefinitionForm
