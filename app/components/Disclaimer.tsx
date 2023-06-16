"use client";

import { useEffect, useState } from "react";
import Modal from "react-modal";

export default function Disclaimer() {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "scroll";
    }
  }, [isOpen]);

  return (
    <div>
      <button
        className="btn text-sm font-normal text-center py-5"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Important Disclaimer! Click here to read.
      </button>
      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="flex flex-col">
          <h2 className="text-center text-xl py-5">Disclaimer</h2>
          <p className="px-2 text-justify text-md">
            This dashboard has been created by Demerzel Solutions Limited (t/a
            Nethermind), a company registered in England and Wales under company
            number 10908862, with its registered address at 30 Churchill Place,
            London E14 5EU (Nethermind, us or we). The dashboard and any
            information by or in connection with it ("content") are provided on
            an 'as is' and 'as available' basis and you are solely responsible
            for all decisions and actions you take regarding your use of the
            dashboard and content. Nethermind makes no warranty, condition or
            representation, express or implied, in relation to the dashboard or
            content, whether in regards to its quality, accuracy, reliability,
            adequacy, outcomes, fitness for purpose, suitability, or otherwise.
            We expressly disclaim any liability for errors or omission in the
            dashboard or content. The dashboard and content are intended for
            informational purposes only. They are not meant to serve as any form
            of advice, whether financial, investment or otherwise. Both past
            performance and yield may not be a reliable guide to future
            performance. Nethermind is not a securities broker/dealer,
            cryptoasset broker/dealer, investment adviser, commodity trading
            advisor, or financial adviser, analyst or planner of any kind. We
            are neither licensed nor qualified to provide investment or trading
            advice, and Nethermind does not explicitly or implicitly recommend
            or suggest an investment strategy of any kind. You should conduct
            their own research and consult an independent financial, tax or
            legal advisor before making any investment decision. To the fullest
            extent permitted by law, Nethermind disclaims any liability
            whatsoever in connection with this dashboard, its content and your
            use thereof, including without limitation for any loss or damage
            (whether direct or indirect) that you may suffer or incur in
            connection with your use of the dashboard or content.
          </p>
          <button
            className="close-btn self-end mt-5 md-5 mr-10 py-3 px-8 grow border rounded focus:outline-none text-md"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
