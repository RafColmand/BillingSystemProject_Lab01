// controllers/sendBillController.js 

const sql = require('mssql');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const { poolPromise } = require('../db');
require('dotenv').config();

exports.newSendBill = async (req, res) => {
    const { id_factura, estado } = req.body;

    if (!id_factura || !estado) {
        return res.status(400).json({ message: 'Todos los datos son requeridos' });
    }
    try {
        const pool = await poolPromise;

        // Verificar existencia de la factura
        const billResult = await pool.request()
            .input('id_factura', sql.Int, id_factura)
            .query('SELECT 1 FROM Factura WHERE id_factura = @id_factura');
        if (billResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }

        //Obtener Detalles cliente
        const client = await pool.request()
            .input('id_factura', sql.Int, id_factura)
            .query('SELECT c.nombre, c.correo FROM Factura f JOIN Clientes c ON f.id_cliente = c.id_cliente WHERE f.id_factura = @id_factura');
        const { nombre, correo } = client.recordset[0];

        //Obtener detalle tienda
        const tienda = await pool.request()
            .input('id_factura', sql.Int, id_factura)
            .query('SELECT t.nombre, t.direccion FROM Factura f JOIN Tiendas t ON f.id_tienda = t.id_tienda WHERE f.id_factura = @id_factura');
        const { nombre: nombreTienda, direccion } = tienda.recordset[0];

        //Obtener detalle factiura
        const fact = await pool.request()
            .input('id_factura', sql.Int, id_factura)
            .query('SELECT fecha_emision FROM Factura WHERE id_factura = @id_factura');
        const fecha_emision = fact.recordset[0];

        //Obtener detalles Orden
        const detalle = await pool.request()
            .input('id_factura', sql.Int, id_factura)
            .query('SELECT p.nombre AS producto, d.cantidad AS cantidad, d.precio AS precio, d.subtotal AS subtotal, d.impuesto AS impuesto, d.descuento AS descuento FROM Factura f JOIN Ordenes o ON f.id_orden = o.id_orden JOIN detalleOrden d ON o.id_orden = d.id_orden JOIN Productos p ON d.id_producto = p.id_producto WHERE f.id_factura = @id_factura');
        const detalles = detalle.recordset;

        // Guardar en BD
        const result = await pool.request()
            .input('id_factura', sql.Int, id_factura)
            .input('estado', sql.NVarChar, estado)
            .query(`INSERT INTO Envio_Factura (id_factura, estado) 
                    OUTPUT INSERTED.* 
                    VALUES (@id_factura, @estado)`);

        const envioFactura = result.recordset[0];

        // Generar PDF en memoria
        const doc = new PDFDocument();
        let buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);
            const pdfBase64 = pdfData.toString('base64');

            const data = {
                personalizations: [{
                    to: [{ email: correo }],
                    subject: `Factura ${id_factura}`
                }],
                from: { email: process.env.EMAIL_FROM },
                content: [{
                    type: 'text/plain',
                    value: `Adjunto encontrará la factura ${id_factura}.`
                }],
                attachments: [{
                    content: pdfBase64,
                    filename: `factura_${id_factura}.pdf`,
                    type: 'application/pdf',
                    disposition: 'attachment'
                }]
            };

            try {
                await axios.post('https://api.sendgrid.com/v3/mail/send', data, {
                    headers: {
                        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                res.status(201).json({
                    message: 'Factura registrada y enviada correctamente ✅',
                    envioFactura
                });
            } catch (emailError) {
                console.error('Error al enviar con SendGrid:', emailError.response?.data || emailError.message);
                res.status(500).json({ error: 'Error al enviar el correo con SendGrid ❌' });
            }
        });

        // Contenido del PDF
        doc.fontSize(20).text('Factura', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Factura N°: ${id_factura}`);
        doc.text(`Cliente: ${nombre}`);
        doc.text(`Tienda: ${nombreTienda}`);
        doc.text(`Tienda: ${direccion}`);
        doc.text(`Fecha de emisión: ${fecha_emision.toLocaleString('es-ES')}`);
        doc.moveDown();

        doc.fontSize(14).text('Detalles de la orden');
        doc.moveDown();

        const startX = 50;
        let startY = doc.y;
        const rowHeight = 20;

        // Encabezados
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text('N°', startX, startY);
        doc.text('Producto', startX + 80, startY);
        doc.text('Cantidad', startX + 180, startY);
        doc.text('Precio Unit.', startX + 250, startY);
        doc.text('Impuesto', startX + 340, startY);
        doc.text('Descuento', startX + 410, startY);
        doc.text('Subtotal', startX + 490, startY);

        startY += rowHeight;
        doc.font('Helvetica').fontSize(12);

        let total = 0;
        let total_descuento = 0;
        let total_impuesto = 0;

        // Filas con datos
        detalles.forEach((item, index) => {
            total += (item.precio);
            total_descuento += item.descuento;
            total_impuesto += item.impuesto;

            doc.text(index + 1, startX, startY);
            doc.text(item.producto, startX + 30, startY);
            doc.text(item.cantidad, startX + 180, startY);
            doc.text(`$${item.precio.toFixed(2)}`, startX + 250, startY);
            doc.text(`$${item.impuesto}`, startX + 340, startY);
            doc.text(`$${item.descuento}`, startX + 410, startY);
            doc.text(`$${item.subtotal.toFixed(2)}`, startX + 490, startY);

            startY += rowHeight;
        });

        
        doc.moveDown(2);

        const pageWidth = doc.page.width;    // ancho total del PDF
        const marginRight = 100;              // margen derecho deseado

        doc.font('Helvetica-Bold').fontSize(14);

        const totalImpuestoText = `Total impuesto: $${total_impuesto.toFixed(2)}`;
        const totalDescuentoText = `Total descuento: $${total_descuento.toFixed(2)}`;
        const totalPagarText = `Total a pagar: $${total.toFixed(2)}`;

        // Calcular ancho del texto para alinear a la derecha
        const xImpuesto = pageWidth - marginRight - doc.widthOfString(totalImpuestoText);
        const xDescuento = pageWidth - marginRight - doc.widthOfString(totalDescuentoText);
        const xPagar = pageWidth - marginRight - doc.widthOfString(totalPagarText);

        doc.text(totalImpuestoText, xImpuesto, startY);
        startY += rowHeight;
        doc.moveDown();
        doc.text(totalDescuentoText, xDescuento, startY);
        startY += rowHeight;
        doc.moveDown();
        doc.text(totalPagarText, xPagar, startY);

        doc.end();

    } catch (dbError) {
        console.error("Error en registro de Envio_Factura:", dbError);
        res.status(500).json({ error: dbError.message });
    }
};

// Consultar todos los roles
exports.searchSendBill = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM EnvioFactura');

        res.json(result.recordset);
    } catch (error) {
        console.error("Error al obtener las facturas enviadas:", error);
        res.status(500).json({ error: error.message });
    }
};

// Consultar un rol por su ID
exports.searchSendBillById = async (req, res) => {
    const id_envioFactura = parseInt(req.params.id, 10);

    if (isNaN(id_envioFactura)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_envioFactura', sql.Int, id_envioFactura)
            .query('SELECT * FROM Rol WHERE id_envioFactura = @id_envioFactura');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Factura enviada no encontrada' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Error al obtener la factura enviada:", error);
        res.status(500).json({ error: error.message });
    }
};


// Actualizar rol existente
exports.updateSendBill = async (req, res) => {
    const id_envioFactura = parseInt(req.params.id, 10);
    const { estado } = req.body;

    if (isNaN(id_envioFactura)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('estado', sql.Int, estado)
            .query(`
        UPDATE EnvioFactura
        SET estado = COALESCE(@estado, estado)
        WHERE id_envioFactura = @id_envioFactura`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Envio de factura no encontrado' });
        }

        res.json({ message: 'Estado del envio actualizado exitosamente' });
    } catch (error) {
        console.error("Error al actualizar rol:", error);
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un envio de factura
exports.deleteSendBill = async (req, res) => {
    const id_envioFactura = parseInt(req.params.id, 10);

    if (isNaN(id_envioFactura)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_envioFactura', sql.Int, id_rol)
            .query('DELETE FROM Rol WHERE id_envioFactura = @id_envioFactura');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Factura enviada no encontrada' });
        }

        res.json({ message: 'Envio de factura eliminado exitosamente' });
    } catch (error) {
        console.error("Error al eliminar un Envio de factura:", error);
        res.status(500).json({ error: error.message });
    }
};