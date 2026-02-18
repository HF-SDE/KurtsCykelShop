import { Button } from "../ui/button";
import { HStack } from "../ui/hstack";

export function CasesActionRow() {
    return (
        <HStack space="md" className="flex gap-4">
            <Button className="flex-1 rounded-2xl">
                Opret ny
            </Button>
            <Button className="flex-1 rounded-2xl">
                Filtre
            </Button>
        </HStack>
    )
}