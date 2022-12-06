import { t } from "./trpc";
import type { GameService } from "./services/game/service";
import type { UserService } from "./services/user/service";
import type { DeckService } from "./services/deck/service";
import type { CardService } from "./services/card/service";
import type { EntityService } from "./services/entity/service";

export function createApiRouter(services: ApiServices) {
  return t.router(services);
}

export type ApiServices = {
  game: GameService;
  user: UserService;
  deck: DeckService;
  card: CardService;
  entity: EntityService;
};

export type ApiRouter = ReturnType<typeof createApiRouter>;
