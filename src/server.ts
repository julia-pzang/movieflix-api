import express from 'express';
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json())

app.get('/movies', async (_, res) => {
   const movies = await prisma.movie.findMany({
      orderBy: {
         title: "asc",
      },
      include: {
         genres: true,
         languages: true
      }
   });
   res.json(movies);
});

app.post("/movies", async (req, res) => {
   const { title, genre_id, language_id, oscar_count, release_date } = req.body;

   try {
      const movieWithSameTitle = await prisma.movie.findFirst({
         where: {
            title: { equals: title, mode: "insensitive" }
         },
      });

      if (movieWithSameTitle) {
         res
            .status(409)
            .send({ message: "Já existe um filme com esse título" });
      }

      await prisma.movie.create({
         data: {
            title,
            genre_id,
            language_id,
            oscar_count,
            release_date: new Date(release_date),
         },
      });
   } catch (error) {
      res.status(500).send({ message: "Falha ao cadastrar um filme" });
   }

   res.status(201).send();
});

app.put('/movies/:id', async (req, res) => {
   const id = Number(req.params.id);

   try {
      const movie = await prisma.movie.findUnique({
         where: { id },
      });

      if (!movie) {
         res.status(404).send({ message: "Filme não encontrado" });
      }

      const data = { ...req.body };
      data.release_date = data.release_date ? new Date(data.release_date) : undefined;

      await prisma.movie.update({ where: { id }, data });
   } catch (error) {
      res.status(500).send({ message: "Falha ao atualizar o registro" });
   }
   res.status(200).send();
});

app.delete('/movies/:id', async (req, res) => {
   const id = Number(req.params.id);


   try {

      const movie = await prisma.movie.findUnique({
         where: { id }
      })

      if (!movie) {
         res.status(404).send({ message: 'Filme não encontrado' });
      }

      await prisma.movie.delete({ where: { id } });

   } catch (error) {
      res.status(500).send({ message: 'Falha ao remover o registro' });
   }

   res.status(200).send();
});

app.listen(port, () => {
   console.log(`Servidor em execução em http://localhost:${port}`);
});