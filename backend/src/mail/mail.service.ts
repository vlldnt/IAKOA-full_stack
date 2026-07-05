import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

export interface MailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Service d'envoi d'emails.
 *
 * - RESEND_API_KEY présente → envoi réel via Resend (domaine iakoa.fr)
 * - absente (dev/test) → les emails sont simplement journalisés, aucun envoi
 *
 * L'envoi est "best-effort" : un échec est journalisé mais ne fait jamais
 * échouer la requête appelante (inscription, demande de reset…).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = process.env.MAIL_FROM || 'Iakoa <no-reply@iakoa.fr>';

    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY absente : les emails seront journalisés, pas envoyés.');
    }
  }

  async send(payload: MailPayload): Promise<void> {
    if (!this.resend) {
      this.logger.log(`[MAIL non envoyé] À: ${payload.to} — Sujet: ${payload.subject}`);
      this.logger.debug(payload.html);
      return;
    }

    try {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
      if (error) {
        this.logger.error(`Échec d'envoi à ${payload.to}: ${error.message}`);
      }
    } catch (err) {
      this.logger.error(`Échec d'envoi à ${payload.to}`, err instanceof Error ? err.stack : err);
    }
  }

  async sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void> {
    await this.send({
      to,
      subject: 'Réinitialisation de votre mot de passe Iakoa',
      html: this.wrapTemplate(`
        <h2>Réinitialisation de mot de passe</h2>
        <p>Bonjour ${escapeHtml(name)},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.
        Ce lien est valable <strong>1 heure</strong> :</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email :
        votre mot de passe reste inchangé.</p>
      `),
    });
  }

  async sendEmailVerification(to: string, name: string, verifyUrl: string): Promise<void> {
    await this.send({
      to,
      subject: 'Vérifiez votre adresse email — Iakoa',
      html: this.wrapTemplate(`
        <h2>Bienvenue sur Iakoa 🎉</h2>
        <p>Bonjour ${escapeHtml(name)},</p>
        <p>Confirmez votre adresse email pour finaliser votre inscription.
        Ce lien est valable <strong>24 heures</strong> :</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Confirmer mon email
          </a>
        </p>
      `),
    });
  }

  private wrapTemplate(content: string): string {
    return `<!doctype html>
<html lang="fr">
  <body style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; color: #1f2937; max-width: 560px; margin: 0 auto; padding: 24px;">
    ${content}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;" />
    <p style="font-size:12px;color:#6b7280;">Iakoa — découvrez les événements près de chez vous.<br/>
    Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
  </body>
</html>`;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
