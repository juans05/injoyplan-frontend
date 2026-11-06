"use client"
import styles from './condition.module.css'
import terms from './../../../public/svg/terms.svg'
import Link from 'next/link'
import Image from 'next/image'
import { jakarta } from '../../../public/fonts';

const TermsAndConditions = () => {
    return (
        <div className="">
            <div className='bg-[#F8FAFB]'>
                <div className="pt-10 max-w-screen-md mx-auto flex items-center justify-start md:px-8 xl:px-0 px-10">
                    <div>
                        <Image src={terms} alt="termsimg" className='w-full' />
                    </div>
                    <div>
                        <h3 className={`${jakarta.className} md:ml-28 ml-10 text-3xl font-bold text-[#9B292B]`}>Términos y condiciones de uso</h3>
                    </div>
                </div>
            </div>
            <div className={`${jakarta.className} max-w-[1200px] md:mt-20 mt-12 mx-auto mb-10 md:px-8 xl:px-0 px-5`}>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>1. Determinación de datos de identificación</h5>
                    <p className='font-normal md:text-md text-[14px]'>Usted está visitando la página web de INJOYPLAN (el “Sitio Web o la Aplicación”), de titularidad de INJOYPLAN S.A.C., con RUC N° 20603074956, con domicilio en Jr. Guillermo Brenner Mz. B Lote 1, Urbanización Bayer, distrito de Santiago de Surco, provincia y departamento de Lima (En adelante INJOYPLAN). <br />
                        Importante: se denominará “organizador” al responsable original del evento compartido por nuestro Sitio Web y/o aplicación. <br />
                        <br /></p>
                </div>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>2. Acceso y aceptación del Usuario</h5>
                    <p className='font-normal md:text-md text-[14px]'>Los presentes puntos son referidos a los Términos y Condiciones y regulan todo acceso y uso por parte de los Usuarios de los servicios e informaciones que son ofrecidos por el Sitio Web o la Aplicación. La condición de “Usuario” es adquirida por medio de la navegación y/o utilización del Sitio Web o la Aplicación. <br />
                        El Usuario puede acceder y navegar por el Sitio Web o la Aplicación libremente sin necesidad de registrarse y/o suscribirse. Sin embargo, en algunos casos se requerirá del registro y/o suscripción para acceder a los servicios suministrados por INJOYPLAN, a través del Sitio Web o la Aplicación, los cuales pueden estar sujetos a condiciones específicas. <br />
                        <br />
                        Asimismo, el acceso y navegación por el Sitio Web y la Aplicación por parte del Usuario implica la aceptación sin reservas de todas las disposiciones incluidas en los presentes Términos y Condiciones. <br />
                        <br />
                        Es posible que el evento al que se desea inscribir o participar se encuentre sujeto a los Términos y Condiciones del organizador del evento. <br />
                        <br /> </p>
                </div>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>3. Modificación de los Términos y Condiciones</h5>
                    <p className='font-normal md:text-md text-[14px]'>INJOYPLAN se reserva expresamente el derecho a modificar, actualizar o ampliar en cualquier momento los presentes Términos y Condiciones.
                        Cualquier actualización, ampliación o modificación realizada en los presentes Términos y Condiciones será inmediatamente informada mediante publicación siendo de entera responsabilidad del Usuario revisar y considerar nuestros Términos y Condiciones vigentes al momento de la navegación. <br />
                        <br />
                        En caso de que el Usuario no estuviera de acuerdo con las modificaciones mencionadas, podrá optar por no hacer uso de los servicios ofrecidos por INJOYPLAN a través del Sitio Web o la Aplicación. <br />
                        <br /> </p>
                </div>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>4. Servicios ofrecidos por el Sitio Web o la Aplicación</h5>
                    <p className='font-normal md:text-md text-[14px]'>El Sitio Web o la Aplicación ofrecen una plataforma a la que los Usuarios pueden acceder para conocer información de los más actuales eventos que son realizados a nivel nacional o internacional. El Usuario también tiene la posibilidad de compartir el contenido en el Sitio Web o la Aplicación a través de redes sociales u otras plataformas, conforme a los estipulado en el numeral 8 de estos Términos y Condiciones. <br />
                        <br />
                        Los Usuarios reconocen haber proporcionado voluntariamente sus datos personales, de conformidad con nuestra Política de Privacidad, a fin de poder disfrutar de los servicios ofrecidos por el Sitio Web o la Aplicación cuando corresponda. <br />
                        <br />
                        Teniendo en cuenta que INJOYPLAN solo es una plataforma que brinda un servicio de comunicación de eventos realizados por los Organizadores, debemos informar que el servicio que brindamos no garantiza en lo absoluto que el evento al que desea inscribirse o participar llegue a realizarse, tampoco tiene responsabilidad por los pagos realizados a dichos eventos. En ese sentido, el único responsable del desarrollo del evento es el Organizador, asimismo, de entregarle su boleta, factura u otro comprobante de pago por los servicios o eventos que usted vaya a pagar, será el Organizador del evento. <br />
                        <br />
                        De esa forma usted comprende a detalle y acepta que el evento lo provee el Organizador y que INJOYPLAN no asume ningún tipo de responsabilidad por cualquier tipo de complicaciones para el debido desarrollo y flujo del evento, tales como retrasos, cambio de horario y fechas, modificación del detalle o información del evento, entrega equivocada o falla al guardar cualquier comunicación del usuario, o sus criterios de personalización, entre otros. Asimismo, usted comprende y acepta ser responsable de obtener el acceso al servicio, el cual podrá incluir cargos de terceros, tales como cargos del proveedor de acceso a Internet o de comunicaciones. Además, deberá contar con todo el equipo necesario para acceder al servicio y será responsable del mismo. <br />
                        <br /> </p>
                </div>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>5. Uso del Sitio Web o la Aplicación</h5>
                    <p className='font-normal md:text-md text-[14px]'>Los servicios que son ofrecidos a través de nuestro Sitio Web o Aplicación se encuentran solo a disposición de aquellas personas que tengan la capacidad de celebrar contratos legalmente vinculantes de acuerdo a lo establecido por Código Civil peruano vigente y cualquier ley aplicable. Al acceder al Sitio Web o la Aplicación, <strong>el Usuario declara ser mayor de 18 años de edad</strong> y encontrarse facultado a asumir obligaciones vinculantes con respecto a cualquier tipo de responsabilidad que se produzca por el uso del Sitio Web o la Aplicación. <br />
                        <br />
                        <strong>El Usuario se compromete a utilizar el Sitio Web o la Aplicación de conformidad con la Ley, los presentes Términos y Condiciones</strong>, la moral, las buenas costumbres y el orden público. En este sentido, la utilización por parte del Usuario del Sitio Web o la Aplicación se realizará de conformidad con las siguientes directivas: <br />
                        El Usuario se compromete a no utilizar el Sitio Web o la Aplicación con fines ilícitos, que contravengan o contrarios a lo establecido en los presentes Términos y Condiciones, que sean lesivos de los intereses o derechos de terceros, o que de cualquier forma pueda dañar, inutilizar, deteriorar la plataforma o impedir un normal disfrute del Sitio Web o la Aplicación por otros Usuarios. <br />
                        <br />
                        El Usuario se compromete expresamente a no destruir, alterar, inutilizar o, de cualquier otra forma, dañar los datos, programas o documentos electrónicos y demás que se encuentren en el Sitio Web o la Aplicación. <br />
                        <br />
                        El Usuario se compromete a no obstaculizar el acceso a otros Usuarios mediante el consumo masivo de los recursos informáticos a través de los cuales INJOYPLAN presta el servicio, así como a no realizar acciones que dañen, interrumpan o generen errores en dichos sistemas o servicios. <br />
                        <br />
                        El Usuario se compromete a no intentar penetrar o probar la vulnerabilidad de un sistema o de una red propia del Sitio Web o la Aplicación, así como quebrantar las medidas de seguridad o de autenticación del mismo. <br />
                        <br />
                        El Usuario se compromete a hacer un uso adecuado de los contenidos que se ofrecen en el Sitio Web o la Aplicación y a no emplearlos para incurrir en actividades ilícitas, así como a no publicar ningún tipo de contenido ilícito. <br />
                        <br />
                        El Usuario se compromete a no utilizar el Sitio Web, la Aplicación o los correos electrónicos proporcionados en ellas para, a modo de referencia mas no limitativo, enviar correos electrónicos masivos (spam) o correos electrónicos con contenido amenazante, abusivo, hostil, ultrajante, difamatorio, vulgar, obsceno o injurioso. Asimismo, se compromete a no utilizar un lenguaje ilícito, abusivo, amenazante, obsceno, vulgar, racista, ni cualquier lenguaje que se considere inapropiado, ni anunciar o proporcionar enlaces a sitios que contengan materia ilegal u otro contenido que pueda dañar o deteriorar la red personal o computadora de otro Usuario. <br />
                        <br />
                        INJOYPLAN se reserva la potestad de determinar a su libre criterio, cuándo se produce la vulneración de cualquiera de los preceptos enunciados en el presente apartado por parte de los contenidos publicados por algún Usuario, así como la potestad de eliminar dichos contenidos del Sitio Web o la Aplicación. <br />
                        En el caso en que un Usuario infrinja lo establecido en el presente apartado, INJOYPLAN procederá a realizar alguna de las siguientes acciones, dependiendo de la gravedad o recurrencia de la infracción: <br />
                        <br />
                        1° Amonestación al Usuario. <br />
                        <br />
                        2° Suspensión temporal de la cuenta del Usuario. <br />
                        <br />
                        3° Cancelación definitiva de la cuenta del Usuario. <br />
                        <br />
                        4° Acciones por responsabilidades civiles o penales.</p> <br />
                    <br />
                </div>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>6. Registro y responsabilidad por contraseñas</h5>
                    <p className='font-normal md:text-md text-[14px]'>El Usuario podrá navegar por el Sitio Web o la Aplicación sin necesidad de registrarse en una cuenta. Sin embargo, en algunos casos se requerirá del registro para acceder al Sitio Web o la Aplicación. <br />
                        <br />
                        La cuenta de Usuario no debe incluir el nombre de otra persona con la intención de hacerse pasar por esa persona, ni ser ofensivo, vulgar, obsceno o contrario a la moral y las buenas costumbres. <br />
                        <br />
                        Los Usuarios registrados contarán con una clave personal o contraseña con la cual podrán acceder a su cuenta personal. Cada Usuario es responsable de su propia contraseña y deberá mantenerla bajo absoluta reserva y confidencialidad, sin revelarla o compartirla, en ningún caso, con terceros. Cada Usuario es responsable de todas las acciones realizadas mediante el uso de su contraseña. Toda acción realizada a través de la cuenta personal de un Usuario se presume realizada por el Usuario titular de dicha cuenta. <br />
                        <br />
                        En el caso que un Usuario identificara que un tercero conociera y usara su contraseña y su cuenta personal, deberá notificarlo de manera inmediata a INJOYPLAN. <br />
                        <br />

                        INJOYPLAN no será responsable de cualquier daño relacionado con la divulgación del nombre de un Usuario o de su contraseña, o del uso que cualquier persona dé al nombre de un Usuario o contraseña. <br />
                        <br />
                        INJOYPLAN puede solicitar el cambio de un nombre de Usuario y contraseña cuando considere que la cuenta ya no es segura, o si se recibe alguna queja o denuncia respecto al nombre de un Usuario que viole derechos de terceros. <br />
                        <br />
                        Las comunicaciones concernientes a la administración de la contraseña pueden ser enviadas a <Link className="font-bold text-[#007FA4]" href="mailto:contacto@injoyplan.com">contacto@injoyplan.com</Link> <br />
                        <br /></p>
                </div>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>7. Propiedad Intelectual</h5>
                    <p className='font-normal md:text-md text-[14px]'>Todos los derechos de propiedad intelectual del Sitio Web o la Aplicación y de sus contenidos y diseños pertenecen a INJOYPLAN o, en su caso, a terceras personas. En aquellos casos en que sean propiedad de terceros, INJOYPLAN cuenta con las licencias necesarias para su utilización o en su defecto serán correctamente referenciadas o citadas para no infringir derechos de la propiedad intelectual. <br />
                        <br />
                        Quedan expresamente prohibidas la reproducción, distribución, transformación, comunicación pública, puesta a disposición o cualquier modo de utilización, de la totalidad o parte de los contenidos del Sitio Web o la Aplicación, en cualquier soporte y por cualquier medio técnico, sin la autorización de INJOYPLAN. El Usuario se compromete a respetar los derechos de propiedad intelectual de titularidad de INJOYPLAN y de terceros. <br />
                        <br />
                        Asimismo, queda expresamente prohibida la utilización o reproducción de cualquier marca registrada, nombre comercial o logotipo que figure en el Sitio Web o la Aplicación sin la autorización previa y por escrito de INJOYPLAN, así como la utilización del software que opera el Sitio Web o la Aplicación con excepción de aquellos usos permitidos bajo estos Términos y Condiciones. <br />
                        <br />
                        Finalmente, quedan igualmente prohibidas a título enunciativo las siguientes prácticas: <br />
                        La presentación de una página del Sitio Web o la Aplicación en una ventana que no pertenezca a INJOYPLAN, mediante la técnica denominada &quot;framing&quot; a no ser que se cuente con la autorización previa y por escrito de INJOYPLAN. <br />
                        <br />
                        La inserción de una imagen difundida en el Sitio Web o la Aplicación en una página no perteneciente a INJOYPLAN, mediante la técnica denominada &quot;inline linking&quot;, si ello no cuenta con la autorización previa y por escrito de INJOYPLAN. <br />
                        <br /></p>
                </div>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>8. Enlaces de terceros</h5>
                    <p className='font-normal md:text-md text-[14px]'>En el supuesto de que en el Sitio Web o la Aplicación se dispusieran enlaces o hipervínculos hacia otros sitios de Internet, INJOYPLAN declara que no ejerce ningún tipo de control sobre dichos sitios y contenidos. En ningún caso INJOYPLAN asumirá responsabilidad alguna por los contenidos de algún enlace perteneciente a una web ajena, ni garantizará la disponibilidad técnica, calidad, fiabilidad, exactitud, veracidad, validez y constitucionalidad de cualquier material o información contenida en los hipervínculos u otros lugares de Internet. <br />
                        <br />
                        Estos enlaces se proporcionan únicamente para informar al Usuario sobre la existencia de otras fuentes de información sobre un tema concreto, y la inclusión de un enlace no implica la aprobación de la página web enlazada por parte de INJOYPLAN. <br />
                        <br /></p>
                </div>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>9. Limitación de responsabilidad e indemnidad</h5>
                    <p className='font-normal md:text-md text-[14px]'>El uso que el Usuario haga del Sitio Web o la Aplicación o de todas las funcionalidades que estos ofrezcan, incluyendo cualquier contenido, publicación o herramienta, se ofrece y “según su disponibilidad” sin declaraciones o garantías de ningún tipo, tanto explícitas como implícitas, incluidas entre otras, las garantías de comerciabilidad, adecuación a un fin particular y no incumplimiento, salvo así lo establezca la legislación aplicable de obligado cumplimiento. INJOYPLAN no garantiza que el Sitio Web o la Aplicación sea siempre seguro o esté libre de errores, ni que funcione siempre sin interrupciones, retrasos o imperfecciones. <br />
                        <br />
                        INJOYPLAN no se hace responsable de los posibles daños o perjuicios en el Sitio Web o la Aplicación que se puedan derivar de interferencias, omisiones, interrupciones, virus informáticos, averías o desconexiones en el funcionamiento operativo del sistema electrónico, de retrasos o bloqueos en el uso de este sistema electrónico causados por deficiencias o sobrecargas en el sistema de Internet o en otros sistemas electrónicos, así como también de daños que puedan ser causados por terceras personas mediante intromisiones ilegítimas fuera del control de INJOYPLAN. <br /> <br />

                        Asimismo, el INJOYPLAN no se hace responsable por la calidad, utilidad e idoneidad de los productos, servicios o facilidades ofrecidas al Usuario a través del Sitio Web o la Aplicación, y no responderá por las posibles reclamaciones que se pudieran formular relacionadas con este extremo. <br />
                        <br /></p>
                </div>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>10. Datos de Carácter Personal</h5>
                    <p className='font-normal md:text-md text-[14px]'>Los distintos tratamientos de datos personales que INJOYPLAN realiza a través del Sitio Web o la Aplicación, así como las finalidades de dichos tratamientos, serán detallados específicamente en la Política de Privacidad del Sitio Web o la Aplicación a la que el Usuario podrá acceder a través del siguiente enlace:<Link className="font-bold text-[#007FA4]" href="/politicasyprivacidad">http://www.injoyplan.com/politicas-privacidad</Link> <br />
                        <br /></p>
                </div>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>11. Comunicaciones</h5>
                    <p className='font-normal md:text-md text-[14px]'>El Usuario acepta expresamente que la dirección de correo electrónico consignada en el formulario de registro será el medio de contacto oficial entre el Sitio Web o la Aplicación y el Usuario, siendo absoluta responsabilidad de este último verificar que dicho correo electrónico esté siempre activo y funcional para poder recibir todas las comunicaciones procedentes del Sitio Web o la Aplicación. <br />
                        <br />
                        Los mensajes o comunicaciones del Sitio Web o la Aplicación a los Usuarios sólo pueden provenir de las páginas o cuentas oficiales de aquel en redes sociales u otros medios. En caso se detectará que algún Usuario está enviando comunicaciones o realizando publicaciones en nombre del Sitio Web o la Aplicación, INJOYPLAN iniciará las acciones correctivas y legales pertinentes a fin de proteger al resto de Usuarios de posibles riesgos de confusión.
                        De otro lado, toda comunicación que el Usuario desee dirigir al Sitio Web o la Aplicación deberá realizarla a través de la siguiente dirección de correo electrónico: <Link className="font-bold text-[#007FA4]" href="mailto:contacto@injoyplan.com">contacto@injoyplan.com</Link> <br />
                        <br /></p>
                </div>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>12. Fuerza mayor</h5>
                    <p className='font-normal md:text-md text-[14px]'>INJOYPLAN no será responsable por cualquier retraso o falla en el rendimiento o la interrupción en la prestación de los servicios que pueda resultar directa o indirectamente de cualquier causa o circunstancia más allá de su control razonable, incluyendo, pero sin limitarse a fallas en los equipos o las líneas de comunicación electrónica o mecánica, robo, errores del operador, clima severo, terremotos o desastres naturales, huelgas u otros problemas laborales, guerras, o restricciones gubernamentales. <br />
                        <br /></p>
                </div>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>13. Libro de reclamaciones</h5>
                    <p className='font-normal md:text-md text-[14px]'>Conforme a lo establecido en el Código de Protección y Defensa del Consumidor, Ley N° 29571, el Sitio Web o la Aplicación pone a disposición del Usuario un Libro de Reclamaciones virtual a fin de que éste pueda registrar sus quejas o reclamos formales sobre los servicios ofrecidos a través del Sitio Web o la Aplicación. El Libro de Reclamaciones virtual puede ser encontrado en el siguiente enlace: <Link className="font-bold text-[#007FA4]" href="/libro-de-reclamaciones">http://www.injoyplan.com/libro-de-reclamaciones</Link> <br /> <br /></p>
                </div>
                <div>
                    <h5 className='font-bold mb-6 md:text-[16px] text-[14px]'>14. Autoridades y requerimientos legales</h5>
                    <p className='font-normal md:text-md text-[14px]'>INJOYPLAN coopera con las autoridades competentes y con terceros para garantizar el cumplimiento de las leyes en materia de protección de derechos de propiedad intelectual, prevención del fraude, protección al consumidor y otras materias. <br />
                        <br />
                        INJOYPLAN podrá revelar la información personal del Usuario del Sitio Web o la Aplicación bajo requerimiento de las autoridades judiciales o administrativas competentes, en la medida en que discrecionalmente lo entienda necesario, para efectos de investigaciones conducidas por ellas, cuando se trate de investigaciones de carácter penal o de fraude, o las relacionadas con piratería informática, la violación de derechos de autor, infracción de derechos de propiedad intelectual u otra actividad ilícita o ilegal que pueda exponer al Sitio Web o la Aplicación o a sus Usuarios a cualquier responsabilidad legal. <br />
                        <br />
                        Asimismo, INJOYPLAN se reserva el derecho de comunicar información sobre sus Usuarios a otros Usuarios, a entidades o a terceros, cuando haya motivos suficientes para considerar que la actividad de un Usuario sea sospechosa de intentar o cometer un delito o intentar perjudicar a otras personas. Este derecho será utilizado por INJOYPLAN a su entera discreción cuando lo considere apropiado o necesario para mantener la integridad y seguridad del Sitio Web o la Aplicación y la de sus Usuarios, para hacer cumplir los presentes Términos y Condiciones, y a efectos de cooperar con la ejecución y cumplimiento de la ley. <br />
                        <br />  </p>
                </div>
                <div>
                    <h5 className='font-bold'>15. Inexistencia de sociedad o relación laboral</h5>
                    <p className='font-normal md:text-md text-[14px]'>La participación de un usuario u organizados en el Sitio Web o la Aplicación no constituye ni crea contrato de sociedad, de representación, de mandato, como así tampoco relación laboral alguna entre dicho Usuario u organizador y INJOYPLAN. <br />
                        <br /></p>
                </div>
                <div>
                    <h5 className='font-bold'>16. Cesión de posición contractual</h5>
                    <p className='font-normal md:text-md text-[14px]'>Los Usuarios autorizan expresamente la cesión de estos Términos y Condiciones y de su información personal en favor de cualquier persona que (i) quede obligada por estos Términos y Condiciones y/o (ii) que sea el nuevo responsable del banco de datos que contenga su información personal. Luego de producida la cesión, INJOYPLAN no tendrá ninguna responsabilidad con respecto de cualquier hecho que ocurra partir de la fecha de la cesión. El nuevo responsable asumirá todas y cada una de las obligaciones de INJOYPLAN establecidas en los presentes Términos y Condiciones y en la Política de Privacidad respecto al tratamiento, resguardo y conservación de la información personal de los usuarios del Sitio Web o la Aplicación. <br /><br /></p>
                </div>
                <div>
                    <h5 className='font-bold'>17. Ley aplicable y jurisdicción</h5>
                    <p className='font-normal md:text-md text-[14px]'>Los presentes Términos y Condiciones se rigen por la ley peruana y cualquier disputa que se produzca con relación a la validez, aplicación o interpretación de los mismos, incluyendo la Política de Privacidad, será resuelta en los tribunales del Cercado de Lima. <br /> <br /></p>
                </div>
            </div>
            <hr />
        </div>
    )
}

export default TermsAndConditions