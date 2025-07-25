"use client"

import { TestDefinitionTestModal } from "@/components/test-definition-test-modal"
import { useTestDefinitionCards } from "./useTestDefinitionCards"
import { TestDefinitionCard } from "./TestDefinitionCard"
import { AddTestDefinitionCard } from "./AddTestDefinitionCard"

export function TestDefinitionCards() {
  const {
    runningTests,
    testDefinitions,
    testModalOpen,
    selectedTest,
    handleQuickRun,
    handleTestWithModal,
    closeModal,
  } = useTestDefinitionCards()

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {testDefinitions.map((test) => (
          <TestDefinitionCard
            key={test.id}
            test={test}
            isRunning={runningTests.includes(test.id)}
            onQuickRun={handleQuickRun}
            onTestWithModal={handleTestWithModal}
          />
        ))}

        <AddTestDefinitionCard />
      </div>

      {selectedTest && (
        <TestDefinitionTestModal
          isOpen={testModalOpen}
          onClose={closeModal}
          testDefinition={selectedTest}
        />
      )}
    </>
  )
}
