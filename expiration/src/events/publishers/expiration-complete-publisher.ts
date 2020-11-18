import { Publisher, Subjects, ExpirationCompleteEvent } from '@gabrielkim13-ticketing/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
