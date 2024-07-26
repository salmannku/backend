import { AppSocket, AppSocketServer } from "../../types/socketTypes";
import Questions from "../../models/questions.model";
import Expert from "../../models/experts.model";
import { Role } from "../../utils/enums";

export const registerQuestionStatusHandlers = (io: AppSocketServer) => {
  io.on(
    "server:notify-user-question-status",
    async ({ id, requester, eta }) => {
      const question = await Questions.findById(id);

      if (!question && requester)
        io.to(requester).emit("user:question-status", {
          success: false,
          error: "question not found",
        });

      if (!question) return;

      const findExpertName = async () => {
        if (!question.experts) return;
        const expert = await Expert.findById(id);
        if (!expert) return;
        return `${expert.first_name} ${expert.last_name}`.trim();
      };

      const room = `${Role.USER}:${question.user.toHexString()}`;

      io.to(room).emit("user:question-status", {
        success: true,
        status: question.status,
        expert: await findExpertName(),
        eta,
      });
    }
  );
};

export const webQuestionStatus = (io: AppSocketServer, socket: AppSocket) => {
  socket.on("user:question-status", async ({ id }: { id: string }) => {
    io.serverSideEmit("server:notify-user-question-status", {
      id,
      requester: socket.id,
    });
  });
};
