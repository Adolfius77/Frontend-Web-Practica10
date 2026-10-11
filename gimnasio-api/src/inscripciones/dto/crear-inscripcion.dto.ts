import { IsInt } from 'class-validator';

// El ValidationPipe global reemplaza el chequeo manual que tenia el
// Controller (Number.isInteger a mano).
export class CrearInscripcionDto {
  @IsInt()
  horarioId!: number;

  @IsInt()
  miembroId!: number;
}
