import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ChallengeStatus } from 'src/challenges/interfaces/challenge-status.enum';

export class ChallengeStatusValidationPipe implements PipeTransform {
  readonly acceptedStatus = [
    ChallengeStatus.ACEITO,
    ChallengeStatus.NEGADO,
    ChallengeStatus.CANCELADO,
  ];

  transform(value: any) {
    const status = value.status.toUpperCase();

    if (!this.isValidStatus(status)) {
      throw new BadRequestException(`${status} é um status inválido`);
    }
  }

  private isValidStatus(status: any) {
    const idx = this.acceptedStatus.indexOf(status);
    return idx !== -1;
  }
}
