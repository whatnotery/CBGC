
(function () {
  'use strict';

  // -------------------------------------------------------------------
  // 1. Rocket.Chat webhook endpoint
  // -------------------------------------------------------------------
  const ROCKET_CHAT_WEBHOOK_URL =
    'https://chat.cornbreadgun.club/hooks/6ade7fd3ee1a7e7afa117b84/imXDRSEgr7AouNzqNjxhqfnPTGto7u5s69CyntvPnuJyZwJ4';

  // -------------------------------------------------------------------
  // 2. Base payload (no attachments)
  // -------------------------------------------------------------------
  const BASE_PAYLOAD = {
    alias: 'rocket.cat',
    text: 'Example message',
  };

  // -------------------------------------------------------------------
  // 3. Human-readable labels
  // -------------------------------------------------------------------
  const FIELD_LABELS = {
    what_name_and_pronouns_do_you_use_required: 'Name & Pronouns',
    email: 'Email',
    how_did_you_hear_about_the_cornbread_community_gun_club: 'Heard About CBGC',
    what_do_you_hope_to_get_out_of_participation_with_CBGC: 'Hopes for Participation',
    how_would_you_describe_your_personal_political_ideology: 'Political Ideology',
    have_you_ever_been_involved_in_any_political_organizations: 'Political Organizations',
    do_you_have_any_previous_experience_with_firearms: 'Firearm Experience',
    are_there_safety_and_or_legal_reasons_you_should_not_be_around_firearms: 'Safety/Legal Reasons',
    if_yes_to_the_above_please_explain: 'Safety/Legal Explanation',
    are_you_now_or_have_you_ever_been_involved_in_any_military_or_law_enforcement_organizations: 'Military/Law Enforcement',
    if_yes_to_the_above_please_explain_your_involvement: 'Military/Law Enforcement Explanation',
  };

  // -------------------------------------------------------------------
  // 4. Wire up the form
  // -------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('cbgcForm');
    if (!form) {
      console.warn('[cbgc-form] #cbgcForm not found on this page.');
      return;
    }

    const statusEl = document.getElementById('statusMessage');

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (statusEl) {
        statusEl.textContent = 'Sending…';
        statusEl.className = 'text-sm text-gray-600';
      }

      // -------- Collect fields --------
      const formData = new FormData(form);
      const fields = {};

      for (const [key, value] of formData.entries()) {
        const trimmed = typeof value === 'string' ? value.trim() : value;
        if (fields[key]) {
          if (!Array.isArray(fields[key])) fields[key] = [fields[key]];
          fields[key].push(trimmed);
        } else {
          fields[key] = trimmed;
        }
      }

      // -------- Build Markdown text --------
      const readableText = Object.entries(fields)
        .filter(([, v]) => v !== '' && v != null)
        .map(([key, value]) => {
          const label = FIELD_LABELS[key] || key;
          const rendered = Array.isArray(value) ? value.join(', ') : value;
          return `**${label}:** ${rendered}`;
        })
        .join('\n');

      const payload = {
        alias: BASE_PAYLOAD.alias,
        text: readableText || BASE_PAYLOAD.text,
      };

      // -----------------------------------------------------------------
      // 5. Send — CORS-safe path
      //
      //   • Rocket.Chat's webhook returns no Access-Control-Allow-Origin,
      //     so `application/json` triggers a preflight the browser cancels.
      //   • Fix: send as application/x-www-form-urlencoded (a "simple"
      //     request — no preflight), with the JSON wrapped in `payload=`,
      //     which Rocket.Chat's webhook handler understands.
      //   • mode:'no-cors' is required because the server still won't echo
      //     the ACAO header back; the response arrives opaque.
      // -----------------------------------------------------------------
      try {
        const params = new URLSearchParams();
        params.append('alias', payload.alias);
        params.append('text', payload.text);

        await fetch(ROCKET_CHAT_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        if (statusEl) {
          statusEl.textContent = '✅ Thanks! Your application has been submitted.';
          statusEl.className = 'text-sm text-green-700 font-bold';
        }
        form.reset();
      } catch (error) {
        console.error('[cbgc-form] Submission failed:', error);
        if (statusEl) {
          statusEl.textContent =
            '❌ Network error — please check your connection and try again.';
          statusEl.className = 'text-sm text-red-700 font-bold';
        }
      }
    });
  });
})();
