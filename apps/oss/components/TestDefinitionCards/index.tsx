"use client"

import { DefinitionTestModal } from "@/components/test-definition-test-modal"
import { useDefinitionCards } from "./useTestDefinitionCards"
import { DefinitionCard } from "./TestDefinitionCard"
import { AddDefinitionCard } from "./AddTestDefinitionCard"
import type { Definition } from "@tatou/core/types"

export function DefinitionCards() {
  const {
    runningTests,
    testDefinitions,
    testModalOpen,
    selectedTest,
    handleQuickRun,
    handleTestWithModal,
    closeModal,
  } = useDefinitionCards()

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {testDefinitions.map((test: Definition) => (
          <DefinitionCard
            key={test.id}
            test={test}
            isRunning={runningTests.includes(test.id)}
            onQuickRun={handleQuickRun}
            onTestWithModal={handleTestWithModal}
          />
        ))}

        <AddDefinitionCard />
      </div>

      {selectedTest && (
        <DefinitionTestModal
          isOpen={testModalOpen}
          onClose={closeModal}
          testDefinition={selectedTest}
        />
      )}
    </>
  )
}
